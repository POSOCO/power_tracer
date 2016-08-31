# power_tracer
Changes the line width according to line power flow

***
The inputs of a line to the line power tracer are

1. The line end point pixel locations (possibly as a function of length and width of the canvas)

2. Line power flow

3. Line danger flow value

***
Therefore the line object **_state variables_** or **_instance variables_** are

1. Line end points

2. Line power flow

3. Line emergency flow level values array

4. Line color

5. Line thickness

***
The Line Object provides **_getter functions_** that return the following information for plotting

1. Line end points data

2. Line width

3. Line color


***
The Line Object provides **_setter functions_** that can configure the following for plotting

1. Line end points data

2. Line width

3. Line color

***
The plotter object does the following

1. Takes a set of lines and plots them

2. Sets the thickness and color of the lines according to the line state variables like power flow

***
The state variables of the plotter object are the following

1. Set of lines

2. Plotting function

3. Color deciding function

4. Thickness deciding function