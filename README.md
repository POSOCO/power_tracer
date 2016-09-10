# power_tracer
Plots the line width according to the line power flow

##WorkFlow
The work flow of this app is as follows

1. We create required number of **_line objects_** with desired line properties like line end points, line power flow, line nominal flow value, line emergency levels, line voltage level, line conductor type, line color, line thickness, line power eDNA address

2. Then we will create a single **_tracer object_** which will plot all these lines by updating the line flows from the server using the **_eDNA address_** of the line

3. The **tracer can be configured** to have desired refresh rate, plotting algorithm, line thickness per MW, line colors for each of the emergency flow band, modes of plotting like thickness by absolute power flow or thickness by absolute/nominal power flow ratio

4. After everything is configured, the tracer will fetch each of the line object power data from **_eDNA server_** and plot the lines on a canvas

5. Cheers :sparkles: :smile: :sparkles:


## Power Line

The Line Object properties or **_state variables_** or **_instance variables_** are

1. Line end points

2. Line power flow

3. Line emergency flow level values array

4. Line color

5. Line thickness

The Line Object provides **_setter functions_** and **_getter functions_** that return the information about the above instance variables

##Line Tracer

The Line Tracer / Plotter object does the following

1. Takes a set of lines and fetches the line power flow information from eDNA server using the eDNA address of the line power flow data point

2. Plots the lines on a HTML5 canvas

3. Sets the thickness and color of the lines according to the line state variables like line power flow, nominal power flow

***
The state variables of the Line Tracer / Plotter object are the following

1. Plotting function

2. Color deciding function

3. Thickness deciding function

The Line Tracer Object provides **_setter functions_** and **_getter functions_** that return the information about the above instance variables

##Todos

1. Solve the table dynamic sorting problem

2. Do the table [pagination](http://code.ciphertrick.com/2015/06/01/search-sort-and-pagination-ngrepeat-angularjs/) with each page having 100 rows --- done

3. Crete an option to remove arrow animation --- done

4. Crete an option to change arrow speed --- done

5. Add a arrow position attribute to each line section to facilitate homogeneous arrow speed in all line sections


***
Watch the demo of this project [here](https://posoco.github.io/power_tracer/apps/singletest)
