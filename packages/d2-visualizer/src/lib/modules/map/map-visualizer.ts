import * as turf from '@turf/turf';
import {
  BaseVisualizer,
  Visualizer,
} from '../../shared/models/base-visualizer.model';
import { MapLayer } from './layers/map-layer.model';
import { BaseMap } from './models';
import { MapboxStyleSwitcherControl } from 'mapbox-gl-style-switcher';
declare let mapboxgl: any;

export class MapVisualizer extends BaseVisualizer implements Visualizer {
  basemap!: BaseMap;
  layers: MapLayer[] = [];
  zoom = 5;

  style =
    'https://api.maptiler.com/maps/eef16200-c4cc-4285-9370-c71ca24bb42d/style.json?key=CH1cYDfxBV9ZBu1lHGqh';
  source: any;
  accessToken =
    'pk.eyJ1IjoiaWJyYWhpbXdpY2thbWEiLCJhIjoiY2txM3Y2bXJ1MTJoZjJ2cXI1ZW9pdGg2biJ9.RZjlqK5FxQkQuFrh5lZm_g';

  constructor() {
    super();
    mapboxgl.accessToken = this.accessToken;
  }

  setBaseMap(basemap: BaseMap): MapVisualizer {
    this.basemap = basemap;
    return this;
  }

  setZoom(zoom: number): MapVisualizer {
    this.zoom = zoom;
    return this;
  }

  addLayer(layer: MapLayer): MapVisualizer {
    this.layers = [...this.layers, layer];
    return this;
  }

  async loadLayers() {
    this.layers = await Promise.all(
      this.layers.map(async (layer: MapLayer) => {
        await layer.loadFeatures();
        return layer;
      })
    );
  }

  getValidFeatures(features: any[]) {
    return features.filter(
      (feature) =>
        (feature?.geometry?.coordinates || [])[1] >= -90 &&
        (feature?.geometry?.coordinates || [])[1] <= 90
    );
  }

  async draw() {
    await this.loadLayers();

    if (this.layers?.length > 0) {
      const isPointGeometry = (
        this.layers[0].featureCollection?.features || []
      ).some((feature) => feature.geometry.type === 'Point');

      const featureCollection = isPointGeometry
        ? turf.featureCollection(
            this.getValidFeatures(
              this.layers[0].featureCollection?.features || []
            )
          )
        : this.layers[0].featureCollection;

      const bbox = turf.bbox(featureCollection);

      const map = new mapboxgl.Map({
        container: this._id,
        style: this.style,
        zoom: this.zoom,
      });

      map.fitBounds(bbox, { padding: 40 });
      map.addControl(new mapboxgl.NavigationControl());
      map.addControl(new MapboxStyleSwitcherControl());

      map.on('load', () => {
        this.layers.forEach((layer: MapLayer) => {
          map.addSource(layer.id, {
            type: layer.sourceType,
            data: layer.featureCollection,
          });

          map.addLayer({
            id: layer.id,
            type: layer.fillType,
            source: layer.id,
            paint: layer.paint,
          });
        });
      });

      // new MapUtil()
      //   .setMapAnalytics(data as MapAnalytics)
      //   .setGeofeature(this.geoFeatures as any)
      //   .setLegendSet(this.legendSets)
      //   .setMapDashboardItem(this.config.config)
      //   .setMapDashboardExtensionItem(this.mapDashboardExtensionItem)
      //   .setContainer(this._id)
      //   .setStyle(this.layerStyle)
      //   .setShowLegend(this.d2VisualizerMapControl?.showMapLegend)
      //   .setShowLabel(this.d2VisualizerMapControl?.showMapLabel)
      //   .setShowValue(this.d2VisualizerMapControl?.showMapValue)
      //   .setShowMapTitle(this.d2VisualizerMapControl?.showMapTitle)
      //   .setShowBoundary(this.d2VisualizerMapControl?.showMapBoundary)
      //   .setShowMapSummary(this.d2VisualizerMapControl?.showMapSummary)
      //   .draw();
    }
  }
}
