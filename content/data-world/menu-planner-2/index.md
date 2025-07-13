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

{{ show_image(path="res/1-forecasting-flow.png", caption="Figure 1: Demand forecasting components.", width=70) }}

Figure 1 illustrate the demain forecasting components in our system. Basically, there are 3 things to forecast:

- sale of restaurant per day (called restaurant sale forecaster)
- sale of all dishes per day in corresponding restaurants (called dish sale forecaster)
- waste amount of restaurant per day (called restaurant waste forecaster)

We therefore formulate the problem as multi-series forecasting.

## 1. Historical data

{{ show_image(path="res/1-example-sale-dish.png", caption="Figure 1: Example of dish's sale data (All figures are not real).", width=70) }}

{{ show_image(path="res/1-example-sale-restaurant.png", caption="Figure 2: Example of restauralt's sale data (All figures are not real).", width=70) }}

{{ show_image(path="res/1-example-waste-restaurant.png", caption="Figure 3: Example of restauralt's waste data (All figures are not real).", width=70) }}

Figure 1, Figure 2 and Figure 3 demonstrate the sample data of dish sale, restaurant sale and restaurant waste amount. Each of which will be forecast by a dedicated model. Beside, we include the information about other available dimensions into forecasting model as follow.

- **_dish type_**: vegan, meat, fish, chicken
- **_dish name_**: in plain Finnish
- **_opening hour of restaurant_**: each restaurant has a specific openning hour
- **_datetime info_**: such as different datetime encoding (e.g. sinusoidal), national holidays
- **_examination calendar_**: since the restaurants are located inside/near the university campus and the primary customers are students, the examination days are related to the customer quantity (In examination weeks, only students having examination will go to the campus).

All forecasting models are mainly built with `darts` {{ reference(key="JMLR:v23:21-1177") }}. Some other solutions used `scikit-learn` {{ reference(key="JMLR:v12:pedregosa11a") }}, `PyTorch` {{ reference(key="10.5555/3454287.3455008") }} and `PyTorch Lightning` {{ reference(key="Falcon_PyTorch_Lightning_2019") }}.

## 2. Unsuccessful attempts

From my view, I believe that the unsuccessful attempts are equally valuable lessons as the successful ones. Therefore, I also include the discussion of failed model building attempts.

Seriously speaking, the definition of failed model is unclear since "all models are wrong" (George Box). One model is thus considered "less failed" than the other if it can perform better in both offline evaluation and real-world usage. In the context of this blog, a "better model" implies it performs better in offline benchmarks.

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

The global deep learning-based model therefore, in order to capture this significance, must have quite a lot of data to train. Even when we have quite significant amount of data to train, another importance reason degrade the model performance is data staleness. Sale data is difference from year to year.

### 2.3. Forecasting sale at dish-level

We try to forecast the sale of each dish at each restaurant.

This is where thing becomes more complex. Since the data is stored in `pandas` DataFrame, in order to use the existing models of `darts`, it's natural to use function `Timeseries.from_dataframe` to convert data to `Timeseries` instance (as mentioned above, class `Timeseries` plays the central role in library `darts`). This function request the time index (argument `time_col`) must the a datetime with clear period. To put it simply, assume the period is `1 day`, `Timeseries.from_dataframe` requires that entries in the dataframe are of the consecutive days. The problem is, one dish cannot be appeared in consecutive days. In reality, there is no specific period in the days the dish is served.

In other word, it was impossible to use the existing forecasting models in `darts` to build the predictor. We therefore switched to the manually crafted model.

We utilize the regression models in `scikit-learn` and other tree-based candidates such as `xgboosts`, `catboost` and lightgbm`. For deep learning solutions, we manually designed a bunch of models using `PyTorch`. The idea of those self-crafted models varied from RNN, LSTM, Co-Attention to Transformer.

For constructing the covariate \\( X \\), we use the following:

- restaurant
- date info
- dish type
- dish name: we tried both using `nn.Embedding` or using pre-trained models to extract the embedding

{{ show_image(path="res/2-feature-importance.png", caption="Figure 5: Feature importance of a global dish-level sale forecasting model.", width=80) }}

Figure 5 shows that the **_restaurant_** feature accounts for the dish sale. This can be understood in a way that the sale of different restaurant is significantly different. This difference is not only witnessed at restauran-level sale but also at dish-level. That means even the same dish "Meatball" will have significantly different sale in different restaurant.

Another difference between sale of restaurant-level and dish-level is that while restaurant sale changes annualy, dish sale doesn't.

## 3. Current models

Given the unique trend in sale and waste of each restaurant, we abandoned global models but use a distinct forecaster for each restaurant/dish.

In particular, to forecast the sale/waste of each restaurant, a distinct model is used. To deal with the data staleness problem, a popular re-training strategy is employed.

For forecasting the dish sale at each restaurant, given the knowledge about the data (i.e.) plus an accidental but revolutional about how to construct the `Timeseries` instance from `pandas` Dataframe without being constrained in period time index, we were able to build the simple but effective forecasting strategy. Each dish in a separate restaurant, a [NaiveMovingAverage](https://unit8co.github.io/darts/generated_api/darts.models.forecasting.baselines.html#darts.models.forecasting.baselines.NaiveMovingAverage) model is used.

However, each model has dynamic context window size (Context window size is the number of last values used to predict value in current timestamp). Particularly, the context window size for each dish at specific is calculated as follow.

$$
window\\_size = \min \lbrace{ 5, no\\_training\\_data\\_points \rbrace}
$$

# 4. Evaluation - not anymore the race of RMSE

- In research paper, more than a single metric are used to show the superiority of our proposed method compared to baselines.
- In reality, at least from my personal experience, evaluation is no longer the race but the meaningful explanation about our solution. The solution is “meaningful” not only for us, the engineer/data scientist, but also for our manager, for stakeholder - ones that are not very technical. The thing is, if they don’t understand what we are doing, we're doomed.
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

Together with evaluation metrics, we do use other numerical and graphical methods. For instance,

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
