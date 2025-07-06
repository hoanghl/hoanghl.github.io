+++
title = "Menu planner - When demand forecasting meets recommendation"

date = 2025-07-06
description = "Part 1 - The business, the system design and the data"
draft = false

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
subtitle = "Part 1 - The business, the system design and the data"
+++

_Imagine you're the food manager of a company that owns nearly 20 restaurants, and your mission is to create a detailed, up-to-date menu every day. This menu must account for sustainability factors without compromising sales. Our tool is designed to support you in this task. In the first post of our series explaining the philosophy behind what we call the Menu Planner, we explore the business requirements and how we tackled the most challenging issue: managing dish information — the core of the entire operation._

{{ show_image(path="res/cover.png", caption="", width=100) }}

# 1. Business and requirements

To begin with, the company's operations revolve around serving meals through nearly 20 restaurants across Helsinki and Espoo. The primary customers are undergraduate and graduate students. Each year, before the school year begins, the company's food manager creates a comprehensive menu plan. This plan outlines all available dishes for the academic year and fulfills key nutritional requirements. Figure 1 illustrates an example of the menu plan.

Based on this plan, each restaurant manager customizes their own version to suit the specific conditions of their facility. For instance, in smaller restaurants, the number of dishes served daily cannot exceed a certain limit.

{{ show_image(path="res/1-menu-plan.png", caption="Figure 1: Example of annual menu plan. 'G' stands for 'Gluten', 'KELA' refers to a nutrition property of a dish, which follows the authority's policy.", width=100) }}

{{ show_image(path="res/1-menu-restaurant.png", caption="Figure 2: Example of a menu of a specific restaurant on July 1, 2025.", width=80) }}

From Figure 2 showing an example of menu served at a restaura, it can be seen that the number of dishes served daily at a restaurant may differ from the standard menu plan. Additionally, the company's meal business involves 2 key stakeholders, as illustrated in Figure 3. Each, as previously mentioned, is responsible for a specific set of constraints that influence the final menu.

However, the company aims to take these tailored menus a step further. In particular, they are interested in optimizing the menus to adapt with 2 critical goals: **_sale_** and **_sustainability_**.

{{ show_image(path="res/1-business-hierarchy.svg", caption="Figure 3: Business actor hierarchy.", width=90) }}

So, to sum up about the constraints of the menu, we have:

- Nutrition contrainsts (tailored by company's food manager)
- Restaurant facility contraints (tailored by restaurant manager)
- sale
- sustainability,

where 2 last factors are not covered in the current menu crafting procedure. And the company is dreaming about a tool being able to automate this procedure. Kaboom!

Ok, let's first clear the fog with the constraints.

First, the sales constraint. Broadly speaking, it requires that the crafted menu’s projected sales closely reflect actual historical sales. Imagine the following scenario: we are preparing the menu for next Monday for a restaurant located on the Kumpula campus. Historical data shows that, on Mondays, the restaurant serves an average of 500 meals (commonly referred to as “covers” in the restaurant industry). Additionally, the data indicates the sales performance of specific dishes on Mondays as follows:

- Carbonara: 200
- Fish fingers: 250
- Lentil lasagnette: 140

Therefore, it is reasonable to make up a menu with Carbonara and Fish fingers for next Monday. Note that those figures vary from day to day and therefore, a forecasting module is therefore needed to provide the inputs for the recommendation process.

Secondly, the sustainability constraints. The entire world is striving toward a more sustainable future, and Finland—along with this company—is committed to being part of that journey. Specifically, each menu must meet 2 sustainability requirements:

1. The waste amount littered per customer shouldn't be greater than **40g**
2. The CO2 amount theoretically littered per customer as consuming a dish shouldn't be greater than **500g**

Next, the nutrition contraints. These cover various properties of the dishes such as dish type (e.g. vegan, meat, chicken), gluten, etc. Examples of nutrition-related contraints are as folow. This list, in reality, grows up to 10 different constraints.

- 2 vegan dishes/day
- no more than 2 fish dishes per week
- one dish cannot appear twice in the same week
- gluten requirement
- etc.

Finally, the restaurant facility constraints. These are specified based on the current facility ability of each restaurant. Several examples of contraints in this type are as follow.

- Every day they offer **just three different plates** (Thursdays four if they have some ingredients for day’s special) – so should be just three options in the overall menu
- Every day they offer **just two vegans**
- Monday is always **a mashed potato day** (with oven sausage or meat balls)
- On Tuesdays and Thursdays they **always offer fish**
- Day's special is always on Thursdays
- Friday is always a **pasta day**

We can see that, the facility contraints specify specifically which dishes must appear on particular day of the week.

In summary, our target is to recommend the menus tailored for each restaurant given a long list of contraints covering various aspects of the dishes. And the system must be able to seamlessly combine recommendation engine with forecasting models. Given that idea, we propose the system design as described in the following section.

One more thing before ending this section, you can notice that I spend quite a lot describing the business aspect of the work, since I believe that bussiness acknowledgement plays a decisive role in understanding the data - the main object of data science. Deep understanding about business will shed light for successive analyses, solutions and evaluating the system's impact.

# 2. Overview of system design

{{ show_image(path="res/2-system-components.svg", caption="Figure 4: System components.", width=80) }}

Figure 4 illustrates the basic components of the system. The database contains both clean and forecasted data, organized using a Snowflake schema. At the core of the system are the Forecasting and Recommendation modules, and their interaction is outlined in Figure 5.

These 2 components will be discussed in more detail in upcoming blog posts. Additionally, the flow—Forecasting → Recommendation → Database storage—runs offline and is triggered whenever new data becomes available. Recommended menus are also generated during this offline process.

The reason for running this flow offline is that both forecasting and menu generation are time-consuming tasks.

{{ show_image(path="res/2-forecasting-recommendation-flow.svg", caption="Figure 5: Diagram of flow forecasting and recommendation.", width=100) }}

Regarding the implementation, PosgresDB is sufficient for this task. The forecasting library used in this system is [darts](https://unit8co.github.io/darts/). All recommendation logic is written purely in Python.

# 3. Data as a mess

Data has always been the daunting problem for every data science problem and this project is not exception.

## a. Data sources

All data sources are provided as Excel files, and the raw schema is relatively straightforward. There are several types of data files:

1. Historical sales data (i.e., number of covers/meals served per day): This data is collected directly from the POS system at each restaurant. Historical sales data has been available since 2023.

2. Historical waste data per restaurant per day (in kilograms): Every day, after operating hours, the restaurant manager weighs the waste generated by both customers and the cooking process. This data is available for the same time period as the sales data.

3. Menu plan: As introduced in Section 1, this plan is created annually by the company’s food manager. It includes all available dishes for all restaurants. Note that some dishes in the menu plan may have appeared in previous school years, while others are completely new. Additionally, the menus recommended by our system must include only dishes listed in this plan.

4. Dish list: Separate from the annual menu plan, the company maintains a dedicated list of available dishes. This list includes each dish's name, corresponding dish code, and CO₂ emission value (assumed to be fixed per dish). However, this list is intended to be comprehensive, yet in practice, it is incomplete.

Before diving into the most controversal part of the data, I would like to share my practice as working with data science problem.

{% callout() %}
Always imagine the data schema when starting the problem
{% end %}

By doing so, both analysis and prediction tasks become significantly less cumbersome. First, by carefully designing the data schema, we gain a clear understanding of the available data dimensions and how they intersect—namely, the fact tables. This helps us identify where to focus our analysis and where we might need to broaden it.

Second, once the schema is established and the data cleaning code is implemented, we can work with clean data right from the start during both analysis and prediction. This eliminates the need to repeatedly copy and paste cleaning code across multiple notebooks.

## b. Problem with the central business entity: Dishes

The business is built up on the dishes. Using the Kimball's data modelling, dish is formulated as a dimension. The **_dishes_** dimension has several attributes as Figure 6.

{{ show_image(path="res/3-dim-dishes-schema.png", caption="Figure 6: Schema of dimension 'dishes'.", width=25) }}

| Field         |                                                                                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dish_code`   | For each dish, the company employs an unsigned interger as 'id'. However, later, we find out that this field isn't suitable to be dish id (We will explain this below). Therefore, we propose our own `id` field for each dish. |
| `names`       | Naturally, each dish should only has single dish name. However, due to the problem with data, each dish may have more than one name.                                                                                            |
| `restaurants` | Contain the `restaurant_id` of restaurants where this dish used to be served                                                                                                                                                    |
| `dish_type`   | Specify the dish type. There are 5 different types namely _vegan_, _vegetarian_, _chicken_, _fish_ and _meat_.                                                                                                                  |

Now, let's start discussing the most annoying problem with the data of this project: one dish may have more than one name and one dish code. Weird, right? Why does it happen?

As mentioned in the previous section, there are 4 different data sources, and dish information is presented in all of them. While the menu plan and dish list files are composed by the company's food manager, the historical sales and waste files are manually edited by the restaurant manager. As a result, the restaurant manager may occasionally mistype a dish name.

That's the first annoying issue. The second one is that a single dish may have 2 different dish codes. How does this happen? Again, the problem stems from inconsistencies among the data files. While creating the menu plan and dish list, the company manager may mistakenly assign different dish codes to the same dish name.

## c. Solutions to deal with the complexity of `dim_dishes`

Having described the problems, how did we takle those?

### c.1. Dealing with mismatch of dish name

First, we check 2 things in that order:

1. Check if 2 meals have the same dish code
2. If (1) fails, check if 2 names have the Hamming distance below specific threshold.

Sound reasonable, huh? Except one thing, Hamming distance is length dependent. What does it mean? Hamming distance measures the minimum number of substitutions to change string A to string B. Assume we set the threshold in (2) as \\( 3 \\). If 2 string A, B are 10 characters long, Hamming distance = \\( 3 \\) is insignificant, meaning string A and B are likely to be the same. On the other hand, if length of A and B are just 5, Hamming distance = \\( 3 \\) implies that 2 strings are remarkably different.

Therefore, we propose a modification to original Hamming distance, as follow.

$$
modified\\_Hamming(A, B) = \dfrac{Hamming(A, B)}{min \lbrace{ len(A), len(B) \rbrace} }
$$

This modification allows the distance will always in range \\( [0, 1] \\) regardless of string length. In our implementation, we use threshold at \\( 0.1 \\).

### c.2. Dealing with mismatch of dish code

Before explaining the solution, let's briefly describe the the format of each data file. In each Excel file, each entry has the following format:

| dish code | dish name            | ... |
| --------- | -------------------- | --- |
| 123       | Meatball with tomato | ... |

For each pair of entries (2 entries may come from same or different file), we also check the \\( modified\\\_Hamming \\) of 2 dish names with a given threshold. In addition, given this problem, we decided to not use the dish code as 'dish id' but instead propose a new dish id.

### c.3. Combining checking mismatching of both dish name and dish code

Our final algorithm to detect if 2 entries refer to the same dish as follow.

1. Check if 2 entries have the same dish code. If yes -> They are refering to the same dish. Otherwise, go to next step.
2. Check if 2 entries have the \\( modified\\\_Hamming \\) below specific threshold. If yes -> They are refering to the same dish. Otherwise, they are 2 separate dishes.

One might ask in section **_c.1_** and **_c.2_** we both use \\( modified\\\_Hamming \\) as a common solution, why in the final algorithm, we still have to check if 2 entries sharing the same dish code. That is because dish code is, by business logic, still the dish identification, so it is still stronger indicator than dish name to check whether 2 entries refer to single dish. In fact, there are cases that 2 entries refer to the same dish even the \\( modified\\\_Hamming \\) distance is higher than the specified threshold.

### c.4. Applying final checking algorithm with multiple files

During the implementation of the algorithm across all data files, we encountered the problem that the processing code became overly complex and difficult to manage.

Initially, for each file, our code attempted to accomplish 2 tasks within a single Jupyter notebook:

1. Clean and convert the file into a usable format
2. Combine the formatted data with the data from the previous file

However, the formatted data varied from file to file. We even attempted to convert each file directly into the final dim_dishes format (as shown in Figure 6), but this only increased the complexity of the processing code.

To address this, we propose a simple yet effective method. Although we suspect this approach has been used before, since we haven't come across any source that explicitly describes it, we'll take the liberty of referring to it as the Adapter Method, illustrated in Figure 7.

{{ show_image(path="res/3-adapter-method.svg", caption="Figure 7: Adapter method. Each raw file has its own adapter code to process and convert to a common intermediate format. The collector code will apply the mismatching checking on these intermediate files.", width=90) }}

Assume File 1, File 2, etc. represent the raw data sources. In this method, we introduce an intermediate data format that sits between the raw data and the final format (dim_dishes). This intermediate format contains only the most essential columns with cleaned and processed values—without any mismatch checks.

To convert raw data into this shared intermediate format, each raw file is handled by its own dedicated adapter (Adapter 1, Adapter 2, etc.). Later, the mismatch checking logic is applied collectively by a separate collector module operating on the intermediate data.

This Adapter Method cleanly separates data processing from data validation. When a new raw data file appears, we only need to implement a corresponding adapter to convert it into the intermediate format—without changing the mismatch checking logic. Although this approach may sound simple or even trivial, it has significantly improved the maintainability and scalability of our workflow.

After transforming the data into the specified format, the next step is to design the forecasting and recommendation engine, which will be described in the following posts.

# 4. Summary

This first post introduces the fundamental business aspects of our project. It also outlines the constraints that our menu planner must satisfy. Additionally, we guide you through our journey of addressing the challenges we faced with the most critical component of the project: the dish information.
