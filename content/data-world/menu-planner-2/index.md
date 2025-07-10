+++
title = "Menu planner - When demand forecasting meets recommendation"
date = 2025-07-07
description = "Part 2 - Forecasting model in practice: Jumping out of Kaggle's safe zone"
draft = true

template = "page.html"

[taxonomies]
tags = ["ml","recommender-system","time-series-forecast"]


[extra]
show_toc = true
show_copyright = false
show_comments = true
show_shares = false
show_date = true
keywords = "data,machine-learning,recommender-system,time-series-forecast"
subtitle = "Part 2 - Forecasting model in practice: Jumping out of Kaggle's safe zone"
+++

# Abstract

-

{{ show_image(path="res/1-forecasting-flow.svg", caption="Figure 1: Demand forecasting components.", width=100) }}

Figure 1 illustrate the demain forecasting components in our system. Basically, there are 3 things to forecast:

- sale of restaurant per day (called restaurant sale forecaster)
- sale of all dishes per day in corresponding restaurants (called dish sale forecaster)
- waste amount of restaurant per day (called restaurant waste forecaster)

We therefore formulate the problem as multi-series forecasting.

## 1. Historical data

{{ show_image(path="res/1-example-sale-dish.png", caption="Figure 1: Example of dish's sale data.", width=100) }}

Available dimensions:

- dish type: vegan, meat, fish, chicken
- dish name: in plain Finnish
- opening hour of restaurant
- datetime info
- examination calendar

## 2. Unsuccessful attempts

From my view, I believe that the unsuccessful attempts are equally valuable lessons as the successful ones. Therefore, I also include the discussion of failed model building attempts.

Honestly, the definition of failed model is unclear since "all models are wrong" (George Box). One model is considered less failed than the other if it can perform well in both offline evaluation and real-world usage.

### 2.1. Forecasting sale and waste at restaurant-level

- Global model to forecast sale/waste of all restaurant
  Reason:
  - maybe the pattern of each restaurant is different
  - lack of data -> If train all available data -> data staleness
- Global model to forecast

### 2.2. Forecasting sale at dish-level

-

## 3. Current models

- Each dish of each restaurant is

# 4. Evaluation - not anymore the race of RMSE

- In research paper, more than a single metric are used to show the superiority of our proposed method compared to baselines.
- In reality, at least from my personal experience, evaluation is no longer the race but the meaningful explanation about our solution. The solution is “meaningful” not only for us, the engineer/data scientist, but also for our manager, for stakeholder - ones that are not very technical. The thing is, if they don’t understand what we are doing, we’re doomed.
- Initial:
  - R2:
    - Pros: easy to interpret
    - Cons: guys, incorrect for non-linear model. for validation set, normal R2 is no longer suitable. Out-of-sample is more appropriate {{ reference(key="Hawinkel_2023") }}
  - RMSE/MAE:
    - Pros: appropriate, but suitable only for engineer.
    - COns: Hard to "feel" how good it is
      -> The customer wants something they can acknowledge or feel. Such as: our solution error is just 5% is more interpretable than our fancy Deep Learning solution combining 10 transformer-layers could drop the RMSE to 1.5.
  - MAPE:
    - Pros: easy to acknowledge
    - Cons: groundtruth = 0, can ignore those day because on those days, the restaurant is close, so it doesn’t mater what number our system forecast.

TODO: mention that: we haven't yet been able to move to production phase in which we can truly evalutate the impact of our solution towards the business

## 5. Important lessons:

- Always start with the deceptively simple baseline. A baseline should include:

  1. Feature engineering code: code to craft the feature for model
     The input of the feature engineering code:
     - Shouldn't be the raw data but a processed one: not necessarily well processed
     - Should be a fact table
  2. Very simple model
  3. Evaluation process with basic metrics

- Not always global model is best:
  Global model is effective when the data is sufficiently large and/or there are similarities among series

- In time series forecasting, the value at the current timestamp usually depends on the lagged values
  -> Although it sounds simple and straightforward, I believe that is one important characteristic setting time series forecasting apart from standard regression
