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
      geojson as any
    );
  }

  const pathGenerator = d3.geoPath(projection);

  const metrics: GeoCentroidMetric[] = features.map((f: GeoFeature, i: number) => {
    const id = String(f.id ?? f.properties?.name ?? i);
    const name = String(f.properties?.name ?? f.id ?? `Region ${i}`);
    const c = pathGenerator.centroid(f as any);
    const x = Array.isArray(c) && Number.isFinite(c[0]) ? c[0] : 0;
    const y = Array.isArray(c) && Number.isFinite(c[1]) ? c[1] : 0;
    const rawArea = pathGenerator.area(f as any);
    const area = Number.isFinite(rawArea) ? rawArea : 0;
    return { id, name, x, y, area };
  });

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const featuresGroup = svg.append('g').attr('class', 'map-features');
  const centroidsGroup = svg.append('g').attr('class', 'map-centroids');

  const featurePaths = featuresGroup
    .selectAll('path.geo-feature')
    .data(features)
    .join('path')
    .attr('class', 'geo-feature')
    .attr('d', (f: GeoFeature) => pathGenerator(f as any) || '')
    .attr('fill', fillColor)
    .attr('stroke', strokeColor)
    .attr('stroke-width', 1.25)
    .on('click', function (_event: MouseEvent, f: GeoFeature) {
      const idx = features.indexOf(f);
      const index = idx >= 0 ? idx : 0;
      featurePaths.attr('fill', (_d: GeoFeature, j: number) =>
        j === index ? activeColor : fillColor
      );
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
      .attr('fill', activeColor);
  }

  return {
    svg: (svg.node() as SVGSVGElement | null)!,
    projection,
    pathGenerator,
    getCentroids() {
      return metrics.map((m: GeoCentroidMetric) => ({ ...m }));
    },
    projectCoordinate(lonLat: [number, number]): [number, number] | null {
      if (!Array.isArray(lonLat) || lonLat.length < 2) return null;
      return projection(lonLat) as [number, number] | null;
    },
    destroy() {
      svg.remove();
      container.innerHTML = '';
    },
  };
}
