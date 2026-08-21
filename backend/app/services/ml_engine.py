"""
ML Engine
=========
Provides proper machine-learning scoring components for the recommendation engine:

1. TF-IDF Cosine Similarity (Content-Based Filtering)
   - Vectorises resource text (title + description + tags) and learner goal/interests
   - Cosine similarity measures semantic closeness

2. Truncated SVD Collaborative Filtering
   - Builds a user-resource interaction matrix from PathItem completion data
   - Decomposes with scikit-learn's TruncatedSVD
   - Predicts affinity for unseen resources based on latent factor similarity
   - Gracefully falls back to 0.0 when insufficient data exists

3. Bayesian Beta Skill Estimator (used by adaptive_engine)
   - Models skill mastery as Beta(α, β)
   - α increments on correct answers, β on incorrect
   - Returns point estimate (mean) and uncertainty (precision)
"""

from __future__ import annotations

import math
import json
import os
import logging
from typing import Dict, List, Optional, Tuple

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD

logger = logging.getLogger(__name__)

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")


def _load_json(filename: str):
    with open(os.path.join(_DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)


# ─────────────────────────────────────────────
# 1. TF-IDF Content-Based Similarity
# ─────────────────────────────────────────────

class TFIDFContentEngine:
    """
    Computes cosine similarity between a learner query and each resource
    using TF-IDF vector representations.

    Usage:
        engine = TFIDFContentEngine(resources)
        scores = engine.score_all(goal_text="machine learning engineer",
                                   interests=["python", "deep learning"])
        # Returns dict: {resource_id: cosine_score 0.0-1.0}
    """

    def __init__(self, resources: List[dict]):
        self._resources = resources
        self._corpus: List[str] = []
        self._ids: List[str] = []
        self._vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            stop_words="english",
            sublinear_tf=True,
        )
        self._matrix = None
        self._fitted = False
        self._build()

    def _build(self):
        """Build TF-IDF matrix from resource corpus."""
        for r in self._resources:
            text_parts = [
                r.get("title", ""),
                r.get("description", ""),
                " ".join(r.get("tags", [])),
                " ".join(r.get("skills_taught", [])).replace("-", " "),
            ]
            doc = " ".join(filter(None, text_parts)).lower()
            self._corpus.append(doc)
            self._ids.append(r["id"])

        if self._corpus:
            self._matrix = self._vectorizer.fit_transform(self._corpus)
            self._fitted = True
            logger.info(
                "TF-IDF engine built: %d resources, %d features",
                len(self._corpus),
                self._vectorizer.get_feature_names_out().shape[0],
            )

    def score_all(
        self,
        goal_text: str,
        interests: Optional[List[str]] = None,
    ) -> Dict[str, float]:
        """
        Returns {resource_id: cosine_similarity_score 0.0-1.0}.
        """
        if not self._fitted or self._matrix is None:
            return {}

        query_parts = [goal_text or ""]
        if interests:
            query_parts.append(" ".join(interests).replace("-", " "))
        query_doc = " ".join(query_parts).lower()

        try:
            query_vec = self._vectorizer.transform([query_doc])
            sims = cosine_similarity(query_vec, self._matrix)[0]
            return {rid: float(s) for rid, s in zip(self._ids, sims)}
        except Exception as exc:
            logger.warning("TF-IDF scoring failed: %s", exc)
            return {}


# ─────────────────────────────────────────────
# 2. SVD Collaborative Filtering
# ─────────────────────────────────────────────

class SVDCollaborativeFilter:
    """
    Collaborative filter using Truncated SVD on a user-resource interaction matrix.

    The interaction matrix M[i, j] = mastery_level (0.0-1.0) if user i completed
    resource j, else 0.

    After decomposition M ≈ U * Σ * Vt, the predicted affinity for (user, resource)
    is the dot product of their latent vectors.

    Gracefully returns 0.5 (neutral) when:
    - Fewer than MIN_USERS users or MIN_RESOURCES resources exist
    - The target user has no history
    """

    MIN_USERS = 3
    MIN_RESOURCES = 5
    N_COMPONENTS = 20

    def __init__(self):
        self._user_index: Dict[int, int] = {}       # user_id → row
        self._resource_index: Dict[str, int] = {}   # resource_id → col
        self._user_factors: Optional[np.ndarray] = None
        self._resource_factors: Optional[np.ndarray] = None
        self._fitted = False

    def fit(self, interactions: List[Tuple[int, str, float]]):
        """
        Args:
            interactions: List of (user_id, resource_id, completion_score 0-1)
        """
        if not interactions:
            return

        users = sorted({u for u, _, _ in interactions})
        resources = sorted({r for _, r, _ in interactions})

        if len(users) < self.MIN_USERS or len(resources) < self.MIN_RESOURCES:
            logger.info(
                "SVD: insufficient data (%d users, %d resources) — skipping fit",
                len(users), len(resources),
            )
            return

        self._user_index = {uid: i for i, uid in enumerate(users)}
        self._resource_index = {rid: j for j, rid in enumerate(resources)}

        matrix = np.zeros((len(users), len(resources)), dtype=np.float32)
        for uid, rid, score in interactions:
            matrix[self._user_index[uid], self._resource_index[rid]] = score

        n_components = min(self.N_COMPONENTS, len(users) - 1, len(resources) - 1)
        svd = TruncatedSVD(n_components=n_components, random_state=42)
        U = svd.fit_transform(matrix)          # (n_users, n_components)
        Vt = svd.components_                   # (n_components, n_resources)

        self._user_factors = U
        self._resource_factors = Vt.T          # (n_resources, n_components)
        self._fitted = True
        logger.info("SVD fitted: %d users × %d resources, %d components",
                    len(users), len(resources), n_components)

    def predict(self, user_id: int, resource_ids: List[str]) -> Dict[str, float]:
        """
        Predict affinity scores for a user across the given resource IDs.
        Returns {resource_id: score 0.0-1.0}.
        """
        if not self._fitted or user_id not in self._user_index:
            return {rid: 0.0 for rid in resource_ids}

        user_vec = self._user_factors[self._user_index[user_id]]  # (n_components,)

        scores = {}
        for rid in resource_ids:
            if rid in self._resource_index:
                res_vec = self._resource_factors[self._resource_index[rid]]
                raw = float(np.dot(user_vec, res_vec))
                # Normalize to [0, 1] with sigmoid
                scores[rid] = float(1 / (1 + math.exp(-raw)))
            else:
                scores[rid] = 0.0
        return scores


# ─────────────────────────────────────────────
# 3. Bayesian Beta Skill Estimator
# ─────────────────────────────────────────────

class BayesianSkillEstimator:
    """
    Models skill mastery as a Beta distribution Beta(alpha, beta).

    - alpha: "successes" (correct answers, good scores)
    - beta:  "failures"  (incorrect answers, poor scores)
    - Mean = alpha / (alpha + beta)  ← current skill estimate
    - Precision = alpha + beta        ← confidence (higher = more certain)

    Prior: Beta(1, 1) = uniform (no prior knowledge)

    Usage:
        est = BayesianSkillEstimator(alpha=1.0, beta=1.0)
        est.update(score=0.8)   # learner scored 80%
        print(est.mean)         # updated skill level
        print(est.uncertainty)  # how uncertain we are
    """

    def __init__(self, alpha: float = 1.0, beta: float = 1.0):
        self.alpha = float(alpha)
        self.beta = float(beta)

    @classmethod
    def from_level(cls, level: float, confidence: float = 2.0) -> "BayesianSkillEstimator":
        """
        Initialise from a scalar level [0, 1] with given confidence (total pseudo-counts).
        E.g. level=0.7, confidence=4 → alpha=2.8, beta=1.2
        """
        alpha = max(0.1, level * confidence)
        beta = max(0.1, (1.0 - level) * confidence)
        return cls(alpha=alpha, beta=beta)

    @property
    def mean(self) -> float:
        """Point estimate of skill mastery (0.0–1.0)."""
        return self.alpha / (self.alpha + self.beta)

    @property
    def uncertainty(self) -> float:
        """
        Uncertainty metric ∈ (0, 1].
        Higher value = less certain = more useful to assess.
        Based on variance of the Beta distribution.
        """
        n = self.alpha + self.beta
        variance = (self.alpha * self.beta) / (n * n * (n + 1))
        # Max variance of Beta = 0.25 (at alpha=beta=1)
        return min(1.0, variance / 0.25)

    def update(self, score: float) -> "BayesianSkillEstimator":
        """
        Bayesian update given an assessment score in [0, 1].
        Treats score as the fraction of successes in a single observation.
        """
        score = max(0.0, min(1.0, score))
        self.alpha += score
        self.beta += (1.0 - score)
        return self

    def to_dict(self) -> dict:
        return {"alpha": self.alpha, "beta": self.beta}

    @classmethod
    def from_dict(cls, d: dict) -> "BayesianSkillEstimator":
        return cls(alpha=d.get("alpha", 1.0), beta=d.get("beta", 1.0))


# ─────────────────────────────────────────────
# 4. ε-Greedy Exploration Injector
# ─────────────────────────────────────────────

def apply_epsilon_greedy(
    scored_resources: list,  # List[ScoredResource] from recommendation_engine
    epsilon: float = 0.20,
    seed: Optional[int] = None,
) -> list:
    """
    80% of returned resources come from the top-scored list (exploit).
    20% are randomly selected high-potential resources not already in the top list (explore).

    This prevents filter bubbles and introduces diversity into the roadmap.

    Args:
        scored_resources: Already-scored and sorted list
        epsilon: Exploration fraction (default 0.20 = 20%)
        seed: Optional random seed for reproducibility

    Returns:
        New list with exploration resources injected at random positions
    """
    if not scored_resources:
        return scored_resources

    rng = np.random.default_rng(seed)
    n = len(scored_resources)
    n_explore = max(1, int(n * epsilon))
    n_exploit = n - n_explore

    # Top resources = exploit
    exploit_pool = scored_resources[:n_exploit]

    # Remaining resources = explore pool (sample randomly, but prefer higher scores)
    explore_candidates = scored_resources[n_exploit:]
    if explore_candidates:
        # Weight by score so we still pick reasonable resources
        weights = np.array([max(0.01, r.score) for r in explore_candidates])
        weights = weights / weights.sum()
        n_sample = min(n_explore, len(explore_candidates))
        chosen_indices = rng.choice(
            len(explore_candidates), size=n_sample, replace=False, p=weights
        )
        explore_picks = [explore_candidates[i] for i in sorted(chosen_indices)]
    else:
        explore_picks = []

    # Merge: insert exploration picks at random positions within the exploit list
    result = list(exploit_pool)
    for pick in explore_picks:
        insert_pos = int(rng.integers(0, len(result) + 1))
        result.insert(insert_pos, pick)

    return result


# ─────────────────────────────────────────────
# Module-level singletons (built once on import)
# ─────────────────────────────────────────────

def _build_tfidf_engine():
    try:
        resources = _load_json("resources.json")
        return TFIDFContentEngine(resources)
    except Exception as exc:
        logger.warning("TF-IDF engine init failed: %s", exc)
        return None


TFIDF_ENGINE: Optional[TFIDFContentEngine] = _build_tfidf_engine()
SVD_FILTER = SVDCollaborativeFilter()  # Fitted later when DB data available


def refresh_svd(db) -> None:
    """
    Called at startup and periodically to refit the SVD filter
    from current PathItem completion data.
    """
    try:
        from app.models.learning import PathItem, ItemStatus
        from app.models.profile import LearnerSkill

        rows = (
            db.query(PathItem)
            .filter(PathItem.status == ItemStatus.completed)
            .all()
        )
        interactions = []
        for item in rows:
            if item.phase and item.phase.path and item.phase.path.user_id:
                interactions.append((
                    item.phase.path.user_id,
                    item.resource_id,
                    1.0,  # completed = full interaction
                ))

        SVD_FILTER.fit(interactions)
    except Exception as exc:
        logger.warning("SVD refresh failed: %s", exc)
