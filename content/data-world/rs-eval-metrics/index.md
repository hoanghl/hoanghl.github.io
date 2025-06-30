+++
title = "Evaluation metrics in recommender system"
date = 2024-01-23
description = " "
draft = false

[taxonomies]
tags = ["ml","recommender-system"]


[extra]
show_toc = true
show_copyright = false
show_comments = true
show_shares = false
keywords = "data,machine-learning,recommender-system,evaluation"
+++

# Definition of Relevance

The relevance is indicated either by:

- binary value: 1 → like ; 0 → not like
- setting a threshold for non-binary values: given the possible rates are [1, 2…5], all values greater than 3 is considered relevant

Hereafter, the term relevant and positive are used interchangeably.

# Accuracy based metrics

Accuracy based metrics usually require non-binary outputs.

## 1. MSE

Denote:

- \\( y\_{ui} \\): groundtruth rate by user \\( u \\) to item \\( i \\)
- \\( y\_{ui} \\): predicted rate by user \\( u \\) to item \\( i \\)

$$
MSE = \dfrac{1}{\mathcal{D}}  \sum_{(u, i) \in \mathcal{D}} \big( y_{ui} - \hat{y}_{ui} \big)^2
$$

This metric requires no negative sample.

## 2. RMSE

RMSE is intrinsically a square root of MSE

$$
RMSE = \sqrt{\dfrac{1}{\mathcal{D}} \sum_{(u, i) \in \mathcal{D}} \big( y_{ui} - \hat{y}_{ui} \big)^2}
$$

# Decision support metrics

Unlike accuracy based metrics, decision support ones can work with either binary or non-binary outputs because they rely on the idea of relevance.

{{ show_image(path="res/decision_support.jpeg", caption="", width="10") }}

## 1. Precision@k

The evaluation process is as follow:

1. For each user in the test set, you have $M$ items, and out of them, there are $N$ positive items.
2. You forward these $M$ items into model $f_\theta$ to calculate the corresponding scores.
3. You sort these $M$ items w.r.t. their score and take \\( k \\) first items

Precision@k is then calculated as follow:

$$
Precision@k = \dfrac{N_k}{k}
$$

where:

- \\( N_k \\) indicates the number of positive items appearing in the list of \\( k \\) first items

## 2. Recall@k

The process of calculating Recall@k is similar to that of Precision@k. The difference lays on the formula.

$$
Recall@k = \dfrac{N_k}{N}
$$

This definition implies that the Recall@k won’t never reach its perfect value (i.e. \\( 1 \\) ) unless \\( k \geq N \\).

# Ranking-based metrics

## 1. NCDG

- Each testing item has target score (gain):
  - With explicit feedback: the gain is the rating the user gives to the item
  - With implicit feedback: the gain is 1 indicating the user interacts with the item
- Negative samples are items with which the user never interacts.
- The model gives a score (so-called **predicted score**) for every user-item pair (including groundtruth pair and negative pairs) → The items are later sorted w.r.t the ascending order of the predicted scores. This score can be the value before/after sigmoid function (in BCELoss), before/after softmax function (in CrossEntropyLoss)

The formula is as follow:

$$
nDCG@k = \dfrac{DCG@k}{IDCG@k}
$$

where:

$$
DCG@k = \sum_{i=1}^k \dfrac{gain_i}{\log_2(i+1)}
$$

and

$$
IDCG@k = \sum_{i=1}^k \dfrac{gain_i}{\log_2(i+1)}
$$

Note that IDCG is similar with DCG but the items are in ideal order, i.e. the relevant item is placed 1st, and the negative items are in following. In addition, in the case of implicit feedback, the formula of DCG@k (so does with IDCG@k) can be written as follow:

$$
DCG@k = \sum_{i=1}^k \dfrac{rel(i)}{\log_2(i+1)}
$$

where:

- \\( rel(i) = \Bbb{1}\_\text{item \\( i \\) is relevant} \\)

The following flowchart describes setps to calculate nDCG@k in recommendation with implicit feedback case.

{{ show_image(path="res/ndcg_flowchart.jpeg", caption="", width=10) }}

In such case,

$$
DCG@k = \dfrac{0}{\log_2(0+1)} + \dfrac{0}{\log_2(1+1)} + \dfrac{1}{\log_2(2+1)} + \dfrac{0}{\log_2(3+1)} + \dfrac{0}{\log_2(4+1)}
$$

and

$$
IDCG@k = \dfrac{1}{\log_2(0+1)} + \dfrac{0}{\log_2(1+1)} + \dfrac{0}{\log_2(2+1)} + \dfrac{0}{\log_2(3+1)} + \dfrac{0}{\log_2(4+1)}
$$

Although nDCG@k can be used in both cases when the gain is either binary or not, for binary gain case, it is recommended to used MAP@k.

## 2. Mean Average Precision at k (MAP@k)

MAP@k leverages Precision@k to ranking-aware metrics’s world.

Denote:

- \\( U \\): set of users within the test set
- \\( N_u \\): no. relevant items of user \\( u \\) in test set
- \\( rel(i) = \Bbb{1}\_\text{item \\( i \\) is relevant} \\)
- \\( \big( AP@k \big)\_u \\): Average Precision at \\( k \\) of user \\( u \\)

Then, Average Precision at \\( k \\) (AP@k) is calculated is as follow:

$$
AP@k = \dfrac{1}{N_u} \sum_{i=1}^k Precision@i \times rel(i)
$$

MAP@k is therefore calculated as follow:

$$
MAP@k = \dfrac{1}{|U|} \sum_{u \in U} \big( AP@k \big)_u
$$

## 3. Mean Reciprocal Rank at k (MRR@k)

Reciprocal Rank refers to the rank of the first relevant item within the first \\( k \\) items, and Mean Reciprocal Rank averages the Reciprocal Rank at k of all users.

Denote:

- \\( rank_u \\): rank of the first relevant item in first \\( k \\) items of user \\( u \\)

Then, MRR@k is calculated as follow:

$$
MRR@k = \dfrac{1}{|U|} \sum_{u \in U} \dfrac{1}{rank_u}
$$

## 4. Hit Rate at k

Hit Rate at k estimates the average number of users who have the relevant item appearing in first \\( k \\) items. The formula is as follow:

$$
HR@k = \dfrac{1}{|U|} \sum_{u \in U} \Bbb{1}_{\text{relevant item appears in first \\( k \\) items}}
$$
