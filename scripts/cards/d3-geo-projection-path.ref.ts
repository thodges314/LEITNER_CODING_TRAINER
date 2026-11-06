interface GeoFeature {
  type: 'Feature';
  id?: string | number;
  properties?: {
    name?: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

interface GeoCentroidMetric {
  id: string;
  name: string;
  x: number;
  y: number;
  area: number;
}

interface GeoMapOptions {
  width?: number;
  height?: number;
  projectionType?: 'mercator' | 'equirectangular' | 'orthographic';
  padding?: number;
  fillColor?: string;
  activeColor?: string;
  strokeColor?: string;
  showCentroids?: boolean;
  onSelectFeature?: (feature: GeoFeature, metric: GeoCentroidMetric, index: number) => void;
}

interface GeoMapInstance {
  svg: SVGSVGElement;
  projection: d3.GeoProjection;
  pathGenerator: d3.GeoPath;
  getCentroids: () => GeoCentroidMetric[];
  projectCoordinate: (lonLat: [number, number]) => [number, number] | null;
  destroy: () => void;
}

function renderGeoMap(
  container: HTMLElement,
  geojson: GeoFeatureCollection,
  options: GeoMapOptions = {}
): GeoMapInstance {
  const {
    width = 480,
    height = 300,
    projectionType = 'mercator',
    padding = 16,
    fillColor = 'slategray',
    activeColor = 'steelblue',
    strokeColor = 'gray',
    showCentroids = true,
    onSelectFeature,
  } = options;

  container.innerHTML = '';

  const features: GeoFeature[] =
    geojson && Array.isArray(geojson.features) ? geojson.features : [];

  let projection: d3.GeoProjection;
  if (projectionType === 'equirectangular') {
    projection = d3.geoEquirectangular();
  } else if (projectionType === 'orthographic') {
    projection = d3.geoOrthographic();
  } else {
    projection = d3.geoMercator();
  }

  if (features.length > 0) {
    projection.fitExtent(
      [
        [padding, padding],
        [Math.max(padding + 1, width - padding), Math.max(padding + 1, height - padding)],
      ],
      geojson
    );
  }

  const pathGenerator = d3.geoPath(projection);

  const metrics: GeoCentroidMetric[] = features.map((f, i) => {
    const id = String(f.id ?? f.properties?.name ?? i);
    const name = String(f.properties?.name ?? f.id ?? `Region ${i}`);
    const c = pathGenerator.centroid(f);
    const x = Array.isArray(c) && Number.isFinite(c[0]) ? c[0] : 0;
    const y = Array.isArray(c) && Number.isFinite(c[1]) ? c[1] : 0;
    const rawArea = pathGenerator.area(f);
    const area = Number.isFinite(rawArea) ? rawArea : 0;
    return { id, name, x, y, area };
  });

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Geographic map');

  const featuresGroup = svg.append('g').attr('class', 'map-features');
  const centroidsGroup = svg.append('g').attr('class', 'map-centroids');

  const featurePaths = featuresGroup
    .selectAll('path.geo-feature')
    .data(features)
    .join('path')
    .attr('class', 'geo-feature')
    .attr('d', (f: GeoFeature) => pathGenerator(f) || '')
    .attr('fill', fillColor)
    .attr('stroke', strokeColor)
    .attr('stroke-width', 1.25)
    .attr('data-id', (_f: GeoFeature, i: number) => metrics[i].id)
    .attr('data-name', (_f: GeoFeature, i: number) => metrics[i].name)
    .attr('data-index', (_f: GeoFeature, i: number) => String(i))
    .attr('data-active', 'false')
    .on('click', function (_event: any, f: GeoFeature) {
      const idx = features.indexOf(f);
      const index = idx >= 0 ? idx : 0;
      featurePaths
        .attr('data-active', (_d: GeoFeature, j: number) => (j === index ? 'true' : 'false'))
        .attr('fill', (_d: GeoFeature, j: number) => (j === index ? activeColor : fillColor));
      if (typeof onSelectFeature === 'function') {
        onSelectFeature(f, metrics[index], index);
      }
    });

  if (showCentroids !== false) {
    centroidsGroup
      .selectAll('circle.geo-centroid')
      .data(metrics)
      .join('circle')
      .attr('class', 'geo-centroid')
      .attr('cx', (m: GeoCentroidMetric) => m.x)
      .attr('cy', (m: GeoCentroidMetric) => m.y)
      .attr('r', 3.5)
      .attr('fill', activeColor)
      .attr('data-id', (m: GeoCentroidMetric) => m.id);
  }

  return {
    svg: svg.node() as SVGSVGElement,
    projection,
    pathGenerator,
    getCentroids() {
      return metrics.map((m) => ({ ...m }));
    },
    projectCoordinate(lonLat: [number, number]) {
      return projection(lonLat);
    },
    destroy() {
      svg.remove();
      container.innerHTML = '';
    },
  };
}

