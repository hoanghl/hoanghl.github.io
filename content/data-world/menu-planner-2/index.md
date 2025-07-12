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

{{ show_image(path="res/1-example-sale-dish.png", caption="Figure 1: Example of dish's sale data (All figures are not real).", width=80) }}

{{ show_image(path="res/1-example-sale-restaurant.png", caption="Figure 2: Example of restauralt's sale data (All figures are not real).", width=80) }}

{{ show_image(path="res/1-example-waste-restaurant.png", caption="Figure 3: Example of restauralt's waste data (All figures are not real).", width=80) }}

Figure 1, Figure 2 and Figure 3 demonstrate the sample data of dish sale, restaurant sale and restaurant waste amount. Each of which will be forecast by a dedicated model. Beside, we include the information about other available dimensions into forecasting model as follow.

- **_dish type_**: vegan, meat, fish, chicken
- **_dish name_**: in plain Finnish
- **_opening hour of restaurant_**
- **_datetime info_**
- **_examination calendar_**: since t

All forecasting models are mainly built with `darts` {{ reference(key="JMLR:v23:21-1177") }}. Some other solutions used `scikit-learn` {{ reference(key="JMLR:v12:pedregosa11a") }}, `PyTorch` {{ reference(key="10.5555/3454287.3455008") }} and `PyTorch Lightning` {{ reference(key="Falcon_PyTorch_Lightning_2019") }}.

## 2. Unsuccessful attempts

From my view, I believe that the unsuccessful attempts are equally valuable lessons as the successful ones. Therefore, I also include the discussion of failed model building attempts.

Honestly, the definition of failed model is unclear since "all models are wrong" (George Box). One model is considered less failed than the other if it can perform well in both offline evaluation and real-world usage.

### 2.1. `darts` 101

We heavily use `darts` to construct the forecasting model. All logic of `darts` are built upon the class `Timeseries`. There are 2 principal things for this class:

1. The `time index`: Usually indicate the timestamp of the datapoint
2. The `value`: Indicate the value at the given timestamp

Additionally, `darts` also separates the **_target_** and **_covariate_**. Assume we need to predict the sale of a restaurant whose main customers are students of the university nearby. We believe that the number of classes every affect the restaurant sale. Therefore, we use this piece of information into forecasting. In this setting, the class quantity is **_covariate_** and restaurant sale is **_target_**.

Mathematically, **_covariate_** is \\( X \\) - input of forecasting model \\( f\_{\theta} \\):

$$
y = f_{\theta} (X)
$$

In `darts`, both **_covariate_** and **_target_** are presented by `Timeseries` instance. Note that, in time series forecasting, it's very likely that the target of the current timestamp depends on the target values of previous timestamp (these previous target values are called **_lagged values of target_**). `darts` treats these lagged values as covariate values (i.e. the lagged value is just one of many values in feature vector of feature matrix \\( X \\)).

Having mentioned the fundamental of the main library, let's dive into our unsuccessful solutions as forecasting are 3 things.

### 2.2. Forecasting sale and waste at restaurant-level

- Global model to forecast sale/waste of all restaurant
  Reason:
  - maybe the pattern of each restaurant is different
  - lack of data -> If train all available data -> data staleness
- Global model to forecast

### 2.3. Forecasting sale at dish-level

We try to forecast the sale of each dish at each restaurant.

This is where thing becomes more complex. Since the data is stored in `pandas` DataFrame, in order to use the existing models of `darts`, it's natural to use function `Timeseries.from_dataframe` to convert

- Global model to forecast sale of all dishes in all restaurants:

  - Just use dish name and restaurant id without lagged value
  - Tree-based: Each dish has very di

  - Deep Learning base:
    - Transformer/Co-Attention without lagged values
    - RNN/LSTM/Transformer with lagged values:
      - Each dish

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
