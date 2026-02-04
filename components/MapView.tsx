
import React, { useEffect, useRef } from 'react';
import { Property } from '../types';

declare var L: any;

interface MapViewProps {
  properties: Property[];
  selectedProperty: Property | null;
  onMarkerClick: (p: Property) => void;
  sidebarOpen: boolean;
}

const MapView: React.FC<MapViewProps> = ({ properties, selectedProperty, onMarkerClick, sidebarOpen }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  // 初始化地圖（只執行一次）
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    // 檢查 Leaflet 是否載入
    if (typeof L === 'undefined') {
      console.error('Leaflet 未載入');
      return;
    }

    // 初始化地圖 - 滑順動畫 + 高性能
    mapRef.current = L.map(mapContainerRef.current, { 
      zoomControl: false,
      attributionControl: false,
      // 啟用滑順縮放動畫
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      zoomAnimationThreshold: 4,
      // Canvas 渲染提升性能
      preferCanvas: true,
      // 縮放設定
      wheelDebounceTime: 40,
      wheelPxPerZoomLevel: 120
    }).setView([24.18, 120.70], 12);
    
    // 使用 CartoDB Positron (淺色風格) - 加入快取設定
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      subdomains: 'abcd',
      crossOrigin: true,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 4
    }).addTo(mapRef.current);
    
    L.control.zoom({ position: 'bottomleft' }).addTo(mapRef.current);

    clusterGroupRef.current = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: false,
      zoomToBoundsOnClick: true,
      // 啟用滑順動畫
      animate: true,
      animateAddingMarkers: false,
      disableClusteringAtZoom: 18,
      // 分批載入優化
      chunkedLoading: true,
      chunkInterval: 100,
      chunkDelay: 50,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        // 5個以下：顯示為單獨深藍點（點擊放大展開）
        if (count <= 5) {
          return L.divIcon({
            html: `<div class="marker-dot"></div>`,
            className: 'custom-marker',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
        }
        // 6-15個：50px，16+個：70px
        let size = count <= 15 ? 50 : 70;
        return L.divIcon({
          html: `<div class="cluster-inner" style="width:${size}px;height:${size}px;">${count}</div>`,
          className: 'custom-cluster-icon',
          iconSize: [size, size],
          iconAnchor: [size/2, size/2]
        });
      }
    });
    mapRef.current.addLayer(clusterGroupRef.current);

    // 追蹤用戶位置
    mapRef.current.locate({ watch: true, enableHighAccuracy: true });
    mapRef.current.on('locationfound', (e: any) => {
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(e.latlng, {
          zIndexOffset: 1000,
          icon: L.divIcon({
            className: 'user-location',
            html: `<div class="user-location-dot"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
        }).addTo(mapRef.current);
      } else {
        userMarkerRef.current.setLatLng(e.latlng);
      }
    });

    // 元件卸載時清理
    return () => {
      if (mapRef.current) {
        mapRef.current.stopLocate();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 側邊欄開關時調整地圖尺寸
  useEffect(() => {
    if (!mapRef.current) return;
    const timer = setTimeout(() => { mapRef.current.invalidateSize(); }, 100);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;
    clusterGroupRef.current.clearLayers();

    properties.forEach((p) => {
      if (!p.lat || !p.lng) return;

      // 統一深藍色圓點
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-dot"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      // 價格格式化
      const priceNumber = String(p.price).replace(/萬/g, '');
      
      // Popup 內容（在圓圈上方）
      const popupContent = `
        <div style="padding: 12px 14px; min-width: 220px; font-family: 'Noto Sans TC', sans-serif;">
          <div style="color: #3b82f6; font-size: 11px; font-weight: 500; margin-bottom: 4px;">三灜地產</div>
          <div style="font-size: 14px; color: #1e293b; font-weight: 700; margin-bottom: 4px; line-height: 1.3;">${p.name}</div>
          <div style="color: #f97316; font-size: 20px; font-weight: 800; margin-bottom: 6px;">成交價：${priceNumber}萬</div>
          <div style="color: #94a3b8; font-size: 11px; font-weight: 500;">成交分店：${p.branch} · 成交時間：${p.date}</div>
        </div>
      `;

      const marker = L.marker([p.lat, p.lng], { icon })
        .bindPopup(popupContent, {
          closeButton: true,
          offset: [0, -8],
          className: 'custom-popup',
          autoPan: true,
          autoPanPadding: [50, 50]
        })
        .on('click', (e: any) => {
          onMarkerClick(p);
          marker.openPopup();
        });

      clusterGroupRef.current.addLayer(marker);
    });

    if (properties.length > 0 && !selectedProperty) {
      const bounds = clusterGroupRef.current.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [80, 80] });
      }
    }
  }, [properties, onMarkerClick, selectedProperty]);

  useEffect(() => {
    if (selectedProperty && mapRef.current) {
      mapRef.current.flyTo([selectedProperty.lat, selectedProperty.lng], 17, {
        animate: true,
        duration: 0.8,
        easeLinearity: 0.25
      });
    }
  }, [selectedProperty]);

  return <div ref={mapContainerRef} className="w-full h-full z-0 outline-none" />;
};

export default MapView;
