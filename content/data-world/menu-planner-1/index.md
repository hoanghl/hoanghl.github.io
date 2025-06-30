+++
title = "Menu planner - When demand forecasting meets recommendation \n Part 1 - The tool, the system design and the data"
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

# 0. Abstract

- In short: purpose of the tool: facilitate planning the menus to meet
- What this part covers:
  - -
- Note that: Unlike research papers which only discuss the successful approach, to me, failure and success both give valuable lessons. Therefore, failed attempts will also be described.

# 1. Business and requirements

- Business in overview:
  - The company's food manager anually crafts a menu plan (called **menu plan**)
  - When it comes to each of 20 restaurants, the restaurant manager tailors a detailed menu for each day in the next following weeks. Fig. 1 illustrates the business actor hierarchy.
  - The main customer is undergraduate/graduate students
  - The menu must satisfies various constraints without sacrificing the business and sustainability targets

{{ show_image(path="res/1-business-hierarchy.svg", caption="Fig. 1: Business actor hierarchy", width=60) }}

- Functional requirements:

1.  A crafted menu must have the total sale which is closed with reality:
    example: Every day, a restaurant serves 500 meals (or '**covers**'). By examining historical data, shows that the average cover quantity of some dishes are as follow:

- Carbonara: 200
- Fish fingers: 250
- Lentil lasagnette: 140

Therefore, it is reasonable to make up a menu with Carbonara and Fish fingers. Note that those figures are varied from day to day.

2.  The crafted menu must satisfy a list of constraints:

    - 2 vegan dishes/day
    - no more than 2 fish dishes per week
    - one dish cannot appear twice in the same week
    - gluten requirement
    - etc.

    The list of constraints may grow up to 10

3.  The crafted menu must satisfy the sustainability constraints:

- waste: 40
- CO2

# 2. Overview of system design

{{ show_image(path="res/2-system-components.svg", caption="Fig 1: System component", width=60) }}

- Flow Forecasting → Recommendation → DB storage is run offline and is triggered when new data is available. When user want to visualize

The heart of the entire system is Forecasting module and Recommendation module and the forecasting - recommendation flow is as follow. These 2 components will be covered in details in incoming blogs.

{{ show_image(path="res/2-forecasting-recommendation-flow.svg", caption="Fig. 2: Diagram of flow forecasting and recommendation", width=95) }}

# 3. Data as a mess

Data has always been the daunting problem for every data science problem and this project is not exception.

## a. Data sources

- mostly Excel files
- multiple types of data:
  - historical sale (i.e. number of served covers/meals per day) (in)
  - historical waste amount per restaurant - day and CO2 amount (in kilograms)
  - Dish list: They have a dedicated list of available dishes. This list contains the name and corresponding dish code. The problem is that this list is supposed to contain every dishes but in fact, it’s not.
  - Menu plan: Every year, the company’s food manager tailors a plan consisting of dishes. The manager of each of 17 restaurants will later base on this plan and select the menu for their own restaurant. Fig. 4 shows an example of menu plan.

My practice:

> Always imagine the data schema when starting the problem

## b. Problem with the central business entity: Dishes

- The business is built up on the dishes. Few attributes:

{{ show_image(path="res/3-dim-dishes-schema.png", caption="Fig. 3: Schema of dimension 'dishes'", width=20) }}

- Describe the problems with dimension ‘dishes’:

  - One dish has multiple names (weird, right?)
    TODO: Explain why this happens
    -
  - One dish has multiple meal codes (according to the customer business, the dish code is the ‘id’ of each dish)
  - Dish information is available in different sources and they are inconsistent:
    - Historical sale data
    - Historical waste amount data

{{ show_image(path="res/3-menu-plan.png", caption="Fig. 4: Example of annual menu plan", width=95) }}

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
