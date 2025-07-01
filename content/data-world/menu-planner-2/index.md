+++
title = "Menu planner - When demand forecasting meets recommendation \n Part 2 - Forecasting model in practice: Jumping out of Kaggle’s safe zone"
date = 2025-06-27
description = " "
draft = true

[taxonomies]
tags = ["ml","recommender-system","time-series-forecast"]


[extra]
show_toc = true
show_copyright = false
show_comments = true
show_shares = false
show_date = true
keywords = "data,machine-learning,recommender-system,time-series-forecast"
+++

Evaluation - not anymore the race of RMSE

- In research paper, more than a single metric are used to show the superiority of our proposed method compared to baselines.
- In reality, at least from my personal experience, evaluation is no longer the race but the meaningful explanation about our solution. The solution is “meaningful” not only for us, the engineer/data scientist, but also for our manager, for stakeholder - ones that are not very technical. The thing is, if they don’t understand what we are doing, we’re doomed.
- Initial:
  - R2: easy to interpret, cons: guys, incorrect for non-linear model. for validation set, normal R2 is no longer suitable. Out-of-sample is more appropriate
  - Combination of RMSE and MAE: appropriate, but suitable only for engineer. The customer wants something they can acknowledge or feel. Such as: our solution error is just 5% is more interpretable than our fancy Deep Learning solution combining 10 transformer-layers could drop the RMSE to 1.5.
  - MAPE: easy to acknowledge→ Serious problem: groundtruth = 0, can ignore those day because on those days, the restaurant is close, so it doesn’t mater what number our system forecast.

Forecasting model - wh

Forecast 3 things:

sale of restaurant

sale of each meal

waste amount

TODO: mention that: we haven't yet been able to move to production phase in which we can truly evalutate the impact of our solution towards the business
