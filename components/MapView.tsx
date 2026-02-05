
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
  const directMarkersRef = useRef<any[]>([]);
  const markersMapRef = useRef<Map<string, any>>(new Map());

  // 初始化地圖（只執行一次）
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    // 檢查 Leaflet 是否載入
    if (typeof L === 'undefined') {
      console.error('Leaflet 未載入');
      return;
    }

    // 初始化地圖 - 啟用滑順動畫
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
      // 縮放設定 - 更流暢
      wheelDebounceTime: 40,
      wheelPxPerZoomLevel: 60,
      zoomSnap: 0.5,
      zoomDelta: 0.5
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

    // 不立即创建 clusterGroup，只在需要时创建

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
    if (!mapRef.current) return;
    
    // 篩選有效的點（有座標的點）
    const validProperties = properties.filter(p => p.lat && p.lng);
    
    // 完全清理所有標記和群組
    if (clusterGroupRef.current) {
      clusterGroupRef.current.clearLayers();
      if (mapRef.current.hasLayer(clusterGroupRef.current)) {
        mapRef.current.removeLayer(clusterGroupRef.current);
      }
      clusterGroupRef.current = null;
    }
    
    directMarkersRef.current.forEach(marker => {
      if (marker && mapRef.current) {
        mapRef.current.removeLayer(marker);
      }
    });
    directMarkersRef.current = [];
    markersMapRef.current.clear();

    // 使用聚合群組，圓圈大小根據點數量變化，關閉所有動畫
    clusterGroupRef.current = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: false,  // 關閉分散動畫
      zoomToBoundsOnClick: true,
      animate: false,  // 關閉聚合動畫
      animateAddingMarkers: false,
      singleMarkerMode: false,
      disableClusteringAtZoom: 15,  // 縮放到此級別時直接顯示獨立點
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 50,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        // 所有聚合點都顯示為半透明圓圈，大小根據點數量變化
        let size;
        if (count < 5) {
          size = 35;
        } else if (count < 10) {
          size = 42;
        } else if (count < 20) {
          size = 50;
        } else if (count < 50) {
          size = 60;
        } else if (count < 100) {
          size = 72;
        } else if (count < 200) {
          size = 85;
        } else {
          size = 100;
        }
        // 字體大小根據圓圈大小調整
        let fontSize = size < 45 ? 12 : size < 60 ? 14 : 16;
        return L.divIcon({
          html: `<div class="cluster-inner" style="width:${size}px;height:${size}px;font-size:${fontSize}px;">${count}</div>`,
          className: 'custom-cluster-icon',
          iconSize: [size, size],
          iconAnchor: [size/2, size/2]
        });
      }
    });
    mapRef.current.addLayer(clusterGroupRef.current);

    // 創建所有標記並添加到聚合群組
    validProperties.forEach((p) => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-dot"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const priceNumber = String(p.price).replace(/萬/g, '');
      
      const popupContent = `
        <div style="padding: 10px 12px; min-width: 200px; font-family: 'Noto Sans TC', sans-serif; line-height: 1.4;">
          <div style="color: #3b82f6; font-size: 11px; font-weight: 500; margin-bottom: 2px;">三灜地產</div>
          <div style="font-size: 14px; color: #1e293b; font-weight: 700; margin-bottom: 2px;">${p.name}</div>
          <div style="color: #f97316; font-size: 14px; font-weight: 800; margin-bottom: 2px;">成交價：${priceNumber}萬</div>
          <div style="color: #94a3b8; font-size: 11px; font-weight: 500; margin-bottom: 2px;">成交分店：${p.branch}</div>
          <div style="color: #94a3b8; font-size: 11px; font-weight: 500;">成交時間：${p.date}</div>
        </div>
      `;

      const marker = L.marker([p.lat, p.lng], { icon });
      marker._pinned = false;
      
      marker.bindPopup(popupContent, {
          closeButton: true,
          offset: [0, -8],
          className: 'custom-popup',
          autoPan: false,
          autoClose: false,
          closeOnClick: false
        })
        .on('mouseover', function() {
          this.openPopup();
        })
        .on('mouseout', function() {
          const self = this;
          // 延遲檢查，避免移動到 popup 時誤關閉
          setTimeout(() => {
            if (!self._pinned) {
              self.closePopup();
            }
          }, 100);
        })
        .on('click', function(e: any) {
          // 阻止事件冒泡
          L.DomEvent.stopPropagation(e);
          this._pinned = true;
          this.openPopup();
          onMarkerClick(p);
        })
        .on('popupclose', function() {
          this._pinned = false;
        });

      // 保存標記引用，用於後續查找
      const markerId = `${p.lat}-${p.lng}-${p.name}`;
      markersMapRef.current.set(markerId, marker);
      
      clusterGroupRef.current.addLayer(marker);
    });

    // 調整地圖視圖（帶動畫）
    if (validProperties.length > 0 && !selectedProperty && mapRef.current) {
      const bounds = clusterGroupRef.current.getBounds();
      if (bounds && bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { 
          padding: [80, 80],
          animate: true,
          duration: 0.5
        });
      }
    }
  }, [properties, onMarkerClick, selectedProperty]);

  useEffect(() => {
    if (selectedProperty && mapRef.current && clusterGroupRef.current) {
      // 找到對應的標記
      const markerId = `${selectedProperty.lat}-${selectedProperty.lng}-${selectedProperty.name}`;
      const marker = markersMapRef.current.get(markerId);
      
      // 移動地圖到選中的位置
      mapRef.current.flyTo([selectedProperty.lat, selectedProperty.lng], 16, {
        animate: true,
        duration: 0.6
      });
      
      // 在地圖移動完成後打開 popup
      if (marker) {
        setTimeout(() => {
          // 確保聚合展開後能找到標記
          clusterGroupRef.current.zoomToShowLayer(marker, () => {
            marker._clicked = true;
            marker.openPopup();
          });
        }, 650);
      }
    }
  }, [selectedProperty]);

  return <div ref={mapContainerRef} className="w-full h-full z-0 outline-none" />;
};

export default MapView;
