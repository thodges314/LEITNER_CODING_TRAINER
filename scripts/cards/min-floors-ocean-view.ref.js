function minFloorsForOceanView(heights) {
  if (heights.length <= 1) return 0;
  let totalFloors = 0;
  let minRequired = heights[heights.length - 1] + 1;
  for (let i = heights.length - 2; i >= 0; i--) {
    if (heights[i] < minRequired) {
      totalFloors += minRequired - heights[i];
      minRequired++;
    } else {
      minRequired = heights[i] + 1;
    }
  }
  return totalFloors;
}
