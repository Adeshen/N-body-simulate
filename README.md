# N-body-simulate
A try of n-body optimization

# 整体项目

优化的关键就在于，因为其中会有墙体的阻力,  距离足够远的星体，引力就可以忽略，然后只需找到预设距离中的所有星体。

计算单个星体受力问题就化解为，找目标距离内所有星体

# 方向尝试

使用kd树，2-d 树，将整个平面空间用不同线划分，竖向  横向 交替划分，这是使用2分的思想，在这个情况下找单点，时间复杂度也是log(n)。

因为星体是波动的，波动完了之后都会有星体越界，所以每个时间片都要重建一整颗树。效率低

因而，找了一篇论文，是关于可平衡kd树，无需完全重建，只需部分平衡，也就是kd堆，去实现他的算法，发现效果并没有它所声称的那么好。

然后，急中生智，自己想来一个简单的方法，将所有空间按空间坐标轴 等距离划分了诸多块，这个等距离就刚好是目标距离的1/2。这样，在搜索一个点的相互作用点，仅仅需要搜索周围9个块，九宫格。

# 测试方法

点击不同方案中html，让浏览器实时渲染即可