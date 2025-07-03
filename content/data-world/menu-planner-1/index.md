+++
title = "Menu planner - When demand forecasting meets recommendation"

date = 2025-06-27
description = "Part 1 - The business, the system design and the data"
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
subtitle = "Part 1 - The business, the system design and the data"
+++

# Abstract

- In short: purpose of the tool: facilitate planning the menus to meet
- What this part covers:

  - Fundamental in business
  - Data and problem with most important dimension: dishes

- Note that: Unlike research papers which only discuss the successful approach, to me, failure and success both give valuable lessons. Therefore, failed attempts will also be described.

# 1. Business and requirements

To begin with, the company's business centers around serving the meals with over nearly 20 restaurants across Helsinki and Espoo. The main customer is undergraduate/graduate students. Annually, before the schoolyear begins, the company's food manager crafts a menu plan (called **menu plan**). This menu plan consists of all available dishes for that schoolyear and satisfies some primary requirements related to nutrition. Figure 1 shows an example of menu plan. The manager of each restaurant will later, based on this plan, tailor the menu for their own restaurant to fit with restaurant's facility conditions. For example, for small restaurant, the number of daily served dishes cannot exceed a certain threshold.

{{ show_image(path="res/1-menu-plan.png", caption="Figure 1: Example of annual menu plan. 'G' stands for 'Gluten', 'KELA' refers to a nutrition property of a dish, which follows the authority's policy.", width=80) }}

{{ show_image(path="res/1-menu-restaurant.png", caption="Figure 2: Example of a menu of a specific restaurant on July 1, 2025.", width=60) }}

From the figures, it can be seen that the dish quantity per day of a restaurant may be different from menu plan. In addition, hierarchically, there are essential 2 actors in the meal business of the company, as depicted in Figure 3. Each, as mentioned above, will be responsible for a group of constraints for the final menu. However, the company want to go further with the tailored menus. Particularly, they are interested in adapting the menus with 2 important targets: **_sale_** and **_sustainability_**.

{{ show_image(path="res/1-business-hierarchy.svg", caption="Figure 3: Business actor hierarchy", width=60) }}

So, to sum up about the constraints of the menu, we have:

- Nutrition contrainsts (tailored by company's food manager)
- Restaurant facility contraints (tailored by restaurant manager)
- sale
- sustainability,

where 2 last factors are not covered in the current menu crafting procedure. And the company is dreaming about a tool being able to automate this procedure. Kaboom!

Ok, let's first clear the fog with the constraints.

First, the sale contraint. Roughly speaking, it requires that the crafted menu must have the total sale which is closed with reality. Imagine a scenario as follow. We are crafting the menu for the next Monday for a restaurant at Kumpula campus. The historical data shows that on Monday, that restaurant serves on average 500 meals (for anyone familiar with the restaurant business, this is also called '**covers**'). Also, according to the data, we know the sale of some dishes on Monday are as follow:

- Carbonara: 200
- Fish fingers: 250
- Lentil lasagnette: 140

Therefore, it is reasonable to make up a menu with Carbonara and Fish fingers for next Monday. Note that those figures vary from day to day and therefore, a forecasting module is needed to provide the inputs for the recommendation process.

Secondly, the sustainability contraints. Entire world is talking about sustainable world and seeking the ways to reach that target. Finland and especially the company won't be outside this journey. In particular, there are 2 sustainable requirements for each menu:

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

{{ show_image(path="res/2-system-components.svg", caption="Figure 4: System components", width=60) }}

Figure 4 illustrates the basic components of the system. The database contains both clean data and forecasted data. We employ the Snowflake schema to organize the tables. The heart of the entire system is Forecasting module and Recommendation module and the forecasting - recommendation flow is as Figure 5. These 2 components will be covered in details in incoming blogs. Additionally, flow low Forecasting -> Recommendation -> DB storage is run offline and is triggered when new data is available. The recommended menus are also crafted in this flow (i.e. in offline mode). The reason we let the flow run offline because forecasting and menu crafting take quite long to run.

{{ show_image(path="res/2-forecasting-recommendation-flow.svg", caption="Figure 5: Diagram of flow forecasting and recommendation", width=90) }}

Regarding the implementation, PosgresDB is sufficient for this task. The forecasting library used in this system is [darts](https://unit8co.github.io/darts/). All recommendation logic is written purely in Python.

# 3. Data as a mess

Data has always been the daunting problem for every data science problem and this project is not exception.

## a. Data sources

All data sources are in Excel files and the raw schema is pretty clear. There are multiple types of data file:

1. historical sale (i.e. number of served covers/meals per day):
   This data is collected directly via POS machine at each restaurant. The historical data is available from 2023.

2. historical waste amount per restaurant - day (in kilograms):
   Everyday, after operating hour, the restaurant manager weights the amount of waste littered both by customers and during cooking. The waste data is available in the same period with the sale one.

3. Menu plan:
   As introduced in Section 1, this menu is crafted anually by company's food manager. It contains all available dishes for every restaurants. Note that some dishes in the menu plan already appeared in previous schoolyears while some are totally new. Also, the menus recommended by our system must only contains meals within this

4. Dish list:
   Apart from the annual menu plan, the company has a dedicated list of available dishes. This list contains the name, corresponding dish code and CO2 amount (yes, the company assumes that CO2 amount is fixed for each dish). The problem is that this list is supposed to contain every dishes but in fact, it's not.

Before diving into the most controversal part of the data, I would like to share my practice as working with data science problem.

> Always imagine the data schema when starting the problem

By doing so, both analysis and predicting task would be much less painful. First, by thinking about the data schema, we can be aware of the available dimensions of the data as well as the intersection of thos dimensions - the fact tables. From this, we will know where to focus or where our analysis should expand. Secondly, after coming up with the data schema and implementing the code to clean them, during analysis and predicting, we would right away have the clean data to work on rather than copy-paste the cleaning code snippets across the notebooks.

## b. Problem with the central business entity: Dishes

- The business is built up on the dishes. Few attributes:

{{ show_image(path="res/3-dim-dishes-schema.png", caption="Fig. 3: Schema of dimension 'dishes'", width=20) }}

- Describe the problems with dimension 'dishes':

  - One dish has multiple names (weird, right?)
    TODO: Explain why this happens
    -
  - One dish has multiple meal codes (according to the customer business, the dish code is the 'id' of each dish)
  - Dish information is available in different sources and they are inconsistent:
    - Historical sale data
    - Historical waste amount data

- Different meal names may refer to the same dish ()

## c. Initial attempts to deal with the complexity of `dim_dishes`

## d. Final processing solution

1. Don’t use meal_code as id, propose new id instead

2. Adapter method
   -> Initial try:
   An incremental script handling file by file → cons: complicated, hard when new file is available
   Current solution: Adapter

- Sketch out a intermediate data format (different from the format of table ‘dim_meals’)
- For each data source, create a file processing to the intermediate data format
- Finally, write a script to collect all intermediate tables and transform to the schema of datable `dim_meals`
  → Pros: Code is separated, simple ; when new data source available, just write a adapter code to convert to intermediate
