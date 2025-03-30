<center> <h1>Recommender system loss</h1> </center>

# 0. Brief introduction

This section gives a short introduction about the terms mentioned in the document.

Recommender system, is a very basic form, is a system that facilitates the users in selecting the suitable items among thousands of possible options in online platforms, such as e-commerce, social network, etc. In such system, the user picks and consumes an item (can be a movie, song, product). The action of consuming items is so-called **interactions**.

Regarding the data type, there are two popular data types in recommender system. Explicit feedback refers to the data type in which not only we know which user interacted with which item but also the level of preference for each interaction is explicit. On the other hand, implicit feedback is a data type whose the preference level is occluded. For example, in Netflix platform, each movie is attached the average rating from the users. That rating is calculated from the rating the users give to that movie. However, in reality, this data type isn’t popular and collecting it is neither cost-effective since not all users are willing to give a rate for a product/item. Therefore, the other data type, implicit feedback type, is more prevalent.

# 1. As next word prediction

- The problem is framed as next item prediction as next word prediction problem in NLP
- The model generates the logits vector over item set. The item set may be the entire item set of the dataset or limited to the testing items only.
- The loss is CrossEntropyLoss

# 2. As binary classification task

- BCE loss/log loss
- The interaction between user $u$ and item $i$ has value 1 if user $u$ interacts item $i$, 0 otherwise ⇒ This consideration assumes that every unobserved interactions as negative one
- The negative interactions are sampled from unobserved interactions

Denote:

- User: $u$
- Item: $i$
- Target score: $y_{ui}$ - probability value indicating whether user $u$ interacts with item $i$
- Predicted score: $\hat{y}_{ui}$ - predicted probability
- Interaction set $\mathcal{Y}$
- Negative Interaction set $\mathcal{Y}^-$ - set of (sampled) negative interactions

$$
\mathcal{L} = - \Sigma_{(u, i) \; \in \; \mathcal{Y} \; \cup \; \mathcal{Y}^- } \Big( y_{ui} \log \hat{y}_{ui} + (1 - y_{ui}) \log (1 - \hat{y}_{ui}) \Big)
$$

# 3. As ranking problem

- target: a loss dedicated for crafting a list of items tailored for a specific user

Denote:

- Sigmoid function: $\sigma(x) = \dfrac{1}{1 + \exp (-x)}$
- The score predicted by the model for a specific user - item pair: $\hat{y}_{ui}$
- Margin: $m$
- Set of triplets (user $u$, positive item $i$, negative item $j$): $D_S = \bigl\{ (u, i, j) \; \vert \; i \in I_u^+ \land j \in I_u^-  \bigr\}$

## 3.1. BPR loss

- traditional methods use interactions as positive and non-interaction as negative and likely combine with regularization
- categorized as **pairwise ranking loss**

$$
\mathcal{L} = \Sigma_{u, i, j \in D} \ln \sigma(\hat{y}_{ui} - \hat{y}_{uj}) - \lambda_{\Theta} \lVert \Theta \rVert^2
$$

## 3.2. Hinge loss

- categorized as **pairwise ranking loss**

$$
\mathcal{L} = \max \big( m - \hat{y}_{ui} + \hat{y}_{uj}, 0 \big)
$$

## 3.3. Softmax loss

- categorized as **listwise ranking loss**

$$
\mathcal{L} = -\dfrac{1}{|\mathcal{D}|} \sum_{(u, i) \in \mathcal{D}} \log \Bigg\{ \dfrac{\exp \; (f(u, i))}{\sum_{j=1}^{\mathfrak{R}} \exp \; (f(u, j))} \Bigg\}
$$

where

- $\mathcal{D}$: set of training data (containing tuple of user - positive item)
- $f(u, i)$: scoring function (estimated by neural network)
- $\mathfrak{R}$ is set of total items

⇒ In other words, Softmax loss calculation is done over the entire set of items

One important point is that the function $f(\cdot)$ indicates multiple things. In some works, it implies a function calculating the score given the user $u$ and item $i$. In other works, however, it specifically implies the affinity score function given the user embedding and user embedding. This affinity function can be cosine similarity of dot product. Additionally, the latter implication refers to the last step of the former.

In conclusion, in either way of implication, the output is the score of the user $u$ and item $i$.

## 3.4. Sampled Softmax loss

Despite helping the model learn the most, the biggest issue of Softmax loss is the calculation is done over the entire set of the items, which make it infeasible in reality when the computation is prohibitively expensive, and the item set always change. One trick to tackle this problem is to do softmax over a subset of items. In particular, the Sample Softmax Loss is calculated as follow:

$$
\mathcal{L} = -\dfrac{1}{|\mathcal{D}|} \sum_{(u, i) \in \mathcal{D}} \log \Bigg\{ \dfrac{\exp \; (f(u, i))}{\exp \; (f(u, i)) + \sum_{j \in \mathcal{N}} \exp \; (f(u, j))} \Bigg\}
$$

where:

- $\mathcal{N}$: set of negative items (dedicated for each user)

## 3.5. Soft nearest neighbor

When dealing with multiple positive samples, one can employ the loss in contrastive learning.

Given:

- a batch $b$ containing a list of samples $\{(\mathrm{x}_i, y_i) \; | \; i \in 1..b \}$ where $\mathrm{x}_i \in \mathbb{R}^n$ and $y_i$ are correspondingly the hidden representation and categorical information of sample $i$.
- temperature $\tau \in (0, 1]$
- $d(\mathrm{x}_i, \mathrm{x}_j)$ is the distance defined upon 2 vectors $\mathrm{x}_i$ $\mathrm{x}_j$. It can be L2 or cosine similarity

The soft nearest neighbor loss is defined as follow.

$$
\mathcal{L} = -\dfrac{1}{b} \sum_{i \in 1..b} \log \Biggl\{ \dfrac{\sum_{\substack{j\in 1..b \\ j \ne i \\ y_j = y_i}} \exp - \dfrac{d(\mathrm{x}_i, \mathrm{x}_j)}{\tau} }{\sum_{\substack{k\in 1..b \\ j \ne i}} \exp - \dfrac{d(\mathrm{x}_i, \mathrm{x}_k)}{\tau} } \Biggr\}
$$

# 4. As regression problem

- Treating recommendation task as regression problem is the earliest approach for recommender system.
- this view isn’t suitable with implicit data since in this kind of data, the exact interested degree of a user toward a specific item is not explicitly available. Instead, we only know whether the user interacts with the item
- Use MSELoss
$$
\mathcal{L} = \dfrac{1}{N} \sum_{i=1}^N \big( \hat{y}_{ui} - y_{ui}\big)^2
$$