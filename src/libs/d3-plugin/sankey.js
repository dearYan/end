module.exports = function() {
        var sankey = {},
            nodeWidth = 20,
            nodePadding = 8,
            size = [1, 1],
            nodes = [],
            links = [];
        sankey.nodeWidth = function(_) {
            if (!arguments.length) return nodeWidth;
            nodeWidth = +_;
            return sankey;
        };
        sankey.nodePadding = function(_) {
            if (!arguments.length) return nodePadding;
            nodePadding = +_;
            return sankey;
        };
        sankey.nodes = function(_) {
            if (!arguments.length) return nodes;
            nodes = _;
            return sankey;
        };
        sankey.links = function(_) {
            if (!arguments.length) return links;
            links = _;
            return sankey;
        };
        sankey.size = function(_) {
            if (!arguments.length) return size;
            size = _;
            return sankey;
        };
        sankey.layout = function(iterations) {
            computeNodeLinks();
            computeNodeValues();
            computeNodeBreadths();
            computeNodeDepths(iterations);
            computeLinkDepths();
            return sankey;
        };
        sankey.relayout = function() {
            computeLinkDepths();
            return sankey;
        };
        sankey.link = function() {
            var curvature = 0.35;

            function link(d) {
                var x0 = d.source.x + d.source.dx,
                    x1 = d.target.x,
                    xi = d3.interpolateNumber(x0, x1),
                    x2 = xi(curvature),
                    x3 = xi(1 - curvature),
                    y0 = d.source.y + d.sy + d.dy / 2,
                    y1 = d.target.y + d.ty + d.dy / 2;
                return ("M" + x0 + "," + y0 + "C" + x2 + "," + y0 + " " + x3 + "," + y1 + " " +
                    x1 + "," + y1);
            }
            link.curvature = function(_) {
                if (!arguments.length) return curvature;
                curvature = +_;
                return link;
            };
            return link;
        };
        // Populate the sourceLinks and targetLinks for each node.
        // Also, if the source and target are not objects, assume they are indices.
        function computeNodeLinks() {
                nodes.forEach(function(node) {
                    node.sourceLinks = [];
                    node.targetLinks = [];
                });
                links.forEach(function(link) {
                    var arr;
                    var source = link.source,
                        target = link.target;
                    if (typeof source === "number") source = link.source = nodes[link.source];
                    if (typeof target === "number") target = link.target = nodes[link.target];
                    if (typeof source === "string") {
                        arr = nodes.filter(function(d) {
                            return d.ip == link.source;
                        });
                        if (arr && arr.length) source = link.source = arr[0];
                    }
                    if (typeof target === "string") {
                        arr = nodes.filter(function(d) {
                            return d.ip == link.target;
                        });
                        if (arr && arr.length) target = link.target = arr[0];
                    }
                    if (source) source.sourceLinks.push(link);
                    if (target) target.targetLinks.push(link);
                });
            }
            // Compute the value (size) of each node by summing the associated links.

        function computeNodeValues() {
                nodes.forEach(function(node) {
                    node.value = d3.max([
                        d3.sum(node.sourceLinks, value),
                        d3.sum(node.targetLinks, value), node.value, 50
                    ]);
                });
            }
            // Iteratively assign the breadth (x-position) for each node.
            // Nodes are assigned the maximum breadth of incoming neighbors plus one;
            // nodes with no incoming links are assigned breadth zero, while
            // nodes with no outgoing links are assigned the maximum breadth.

        function computeNodeBreadths() {
            var remainingNodes = nodes,
                nextNodes,
                x = 0;
            while (remainingNodes.length) {
                nextNodes = [];
                remainingNodes.forEach(function(node) {
                    if (!node) return;
                    node.x = x;
                    node.dx = nodeWidth;
                    node.sourceLinks.forEach(function(link) {
                        nextNodes.push(link.target);
                    });
                });
                remainingNodes = nextNodes;
                ++x;
            }
            moveSinksRight(x);
            scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
        }

        function moveSourcesRight() {
            nodes.forEach(function(node) {
                if (!node.targetLinks.length) {
                    node.x = d3.min(node.sourceLinks, function(d) {
                        return d.target.x;
                    }) - 1;
                }
            });
        }

        function moveSinksRight(x) {
            nodes.forEach(function(node) {
                if (!node.sourceLinks.length) {
                    node.x = x - 1;
                }
            });
        }

        function scaleNodeBreadths(kx) {
            nodes.forEach(function(node) {
                node.x *= kx;
            });
        }

        function computeNodeDepths(iterations) {
            var nodesByBreadth = d3.nest().key(function(d) {
                return d.x;
            }).sortKeys(d3.ascending).entries(nodes).map(function(d) {
                return d.values;
            });
            initializeNodeDepth();
            ////resolveCollisions();
            ////for (var alpha = 1; iterations > 0; --iterations) {
            ////    relaxRightToLeft(alpha *= .99);
            ////    resolveCollisions();
            ////    relaxLeftToRight(alpha);
            ////    resolveCollisions();
            ////}
            function initializeNodeDepth() {
                var ky = d3.min(nodesByBreadth, function(nodes) {
                    return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes,
                        value);
                });
                nodesByBreadth.forEach(function(nodes) {
                    ////HL
                    var topH = (size[1] - ky * d3.sum(nodes, value) - nodePadding * (nodes.length)) /
                        2;


                    nodes.sort(function(a, b) {
                        var result = 0;
                        if (a.net > b.net) return 1;
                        if (a.net < b.net) return -1;
                        if (a.targetLinks.length && b.targetLinks.length) {
                            result = a.targetLinks[0].source.ip > b.targetLinks[0].source
                                .ip ? 1 : (a.targetLinks[0].source.ip < b.targetLinks[
                                    0].source.ip ? -1 : (a.ip > b.ip ? 1 : (a.ip <
                                    b.ip ? -1 : 0)))
                        } else {
                            result = a.ip > b.ip ? 1 : (a.ip < b.ip ? -1 : 0);
                        }
                        return result;
                    });

                    for (var i = 0; i < nodes.length; i++) {
                        var node = nodes[i];
                        node.dy = node.value * ky;
                        node.y = topH;
                        topH += node.dy + nodePadding;
                    }
                    ////nodes.forEach(function (node, i) {
                    ////    node.y = i;
                    ////    node.dy = node.value * ky;
                    ////});
                });
                links.forEach(function(link) {
                    link.dy = link.value * ky;
                });
            }

            function relaxLeftToRight(alpha) {
                nodesByBreadth.forEach(function(nodes, breadth) {
                    nodes.forEach(function(node) {
                        if (node.targetLinks.length) {
                            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(
                                node.targetLinks, value);
                            node.y += (y - center(node)) * alpha;
                        }
                    });
                });

                function weightedSource(link) {
                    return center(link.source) * link.value;
                }
            }

            function relaxRightToLeft(alpha) {
                nodesByBreadth.slice().reverse().forEach(function(nodes) {
                    nodes.forEach(function(node) {
                        if (node.sourceLinks.length) {
                            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(
                                node.sourceLinks, value);
                            node.y += (y - center(node)) * alpha;
                        }
                    });
                });

                function weightedTarget(link) {
                    return center(link.target) * link.value;
                }
            }

            function resolveCollisions() {
                nodesByBreadth.forEach(function(nodes) {
                    var node,
                        dy,
                        y0 = 0,
                        n = nodes.length,
                        i;
                    // Push any overlapping nodes down.
                    nodes.sort(ascendingDepth);
                    y0 = topH;
                    for (i = 0; i < n; ++i) {
                        node = nodes[i];
                        dy = y0 - node.y;
                        if (dy > 0) node.y += dy;
                        y0 = node.y + node.dy + nodePadding;
                    }
                    // If the bottommost node goes outside the bounds, push it back up.
                    dy = y0 - nodePadding - size[1];
                    if (dy > 0) {
                        y0 = node.y -= dy;
                        // Push any overlapping nodes back up.
                        for (i = n - 2; i >= 0; --i) {
                            node = nodes[i];
                            dy = node.y + node.dy + nodePadding - y0;
                            if (dy > 0) node.y -= dy;
                            y0 = node.y;
                        }
                    }
                });
            }

            function ascendingDepth(a, b) {
                return a.y - b.y;
            }
        }

        function computeLinkDepths() {
            nodes.forEach(function(node) {
                node.sourceLinks.sort(ascendingTargetDepth);
                node.targetLinks.sort(ascendingSourceDepth);
            });
            nodes.forEach(function(node) {
                var sy = 0,
                    ty = 0;
                var total_sy = d3.sum(node.sourceLinks, function(d) {
                    return d.dy;
                });
                var total_ty = d3.sum(node.targetLinks, function(d) {
                    return d.dy;
                });
                sy = (node.dy - total_sy) / 2;
                ty = (node.dy - total_ty) / 2;
                node.sourceLinks.forEach(function(link) {
                    link.sy = sy;
                    sy += link.dy;
                });
                node.targetLinks.forEach(function(link) {
                    link.ty = ty;
                    ty += link.dy;
                });
            });

            function ascendingSourceDepth(a, b) {
                return a.source.y - b.source.y;
            }

            function ascendingTargetDepth(a, b) {
                if (!a.target || !b.target) return 0;
                if (!a.target.y) return;
                if (!b.target.y) return 0;
                return a.target.y - b.target.y;
            }
        }

        function center(node) {
            return node.y + node.dy / 2;
        }

        function value(link) {
            return link.value;
        }
        return sankey;
    };
