# power_tracer
Changes the line width according to line power flow

The inputs of a line to the line power tracer are

1. The line end point pixel locations (possibly as a function of length and width of the canvas)

2. Line power flow

3. Line danger flow value

4. A function that decides the color of line according to the power flow

5. A function that decides the thickness of the line according to the power flow

Therefore the line object **state variables** or **instance variables** are

1. Line end points

2. Line power flow

3. Line emergency flow level values array

4. Line color function

5. Line thickness function

The Line Object provides **getter functions** that return the following information for plotting

1. Line end points data

2. Line width

3. Line color

The Line Object provides **setter functions** that can configure the following plotting

1. Line end points data

2. Line width determining function

3. Line color determining function
