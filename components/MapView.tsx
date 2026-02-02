
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

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    if (!mapRef.current) {
      // 初始化地圖，設置灰色系底圖
      mapRef.current = L.map(mapContainerRef.current, { 
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: true
      }).setView([24.18, 120.70], 12);
      
      // 使用 CartoDB Positron (極簡灰色風格)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd'
      }).addTo(mapRef.current);
      
      L.control.zoom({ position: 'bottomleft' }).addTo(mapRef.current);

      clusterGroupRef.current = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div class="cluster-inner">${count}</div>`,
            className: 'custom-cluster-icon',
            iconSize: [48, 48],
            iconAnchor: [24, 24]
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
    }

    const timer = setTimeout(() => { mapRef.current.invalidateSize(); }, 400);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;
    clusterGroupRef.current.clearLayers();

    properties.forEach((p) => {
      if (!p.lat || !p.lng) return;
      
      // 分店顏色判斷
      let color = '#94a3b8'; // 預設灰色
      if (p.branch.includes('松竹')) color = '#3b82f6'; // 專業藍
      if (p.branch.includes('南興')) color = '#ef4444'; // 活力紅
      if (p.branch.includes('十期')) color = '#10b981'; // 成功綠

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-circle"><div class="marker-inner" style="background: ${color}"></div></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const googleNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
      const lineShareUrl = `https://line.me/R/msg/text/?【三灜地產】成交好案分享！%0D%0A💎${encodeURIComponent(p.name)}%0D%0A💰總價：${encodeURIComponent(p.price)}%0D%0A📍位置：${encodeURIComponent(p.displayAddress)}`;

      const popupContent = `
        <div class="popup-container" style="padding: 16px; min-width: 220px; font-family: 'Noto Sans TC', sans-serif;">
          <div style="color: #94a3b8; font-size: 11px; font-weight: 900; margin-bottom: 4px; letter-spacing: 1px;">${p.branch} · ${p.date}</div>
          <div style="font-weight: 900; font-size: 20px; margin-bottom: 2px; color: #0f172a; line-height: 1.1; letter-spacing: -1px;">${p.name}</div>
          <div style="color: #ef4444; font-weight: 900; font-size: 28px; margin-bottom: 12px; letter-spacing: -1.5px;">${p.price}</div>
          
          <div style="display: flex; gap: 8px;">
            <a href="${googleNavUrl}" target="_blank" style="flex: 1; text-decoration: none; background: #0f172a; color: white; text-align: center; padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 900; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">開始導航</a>
            <a href="${lineShareUrl}" target="_blank" style="width: 50px; text-decoration: none; background: #06C755; color: white; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-size: 18px;">💬</a>
          </div>
        </div>
      `;

      const marker = L.marker([p.lat, p.lng], { icon })
        .on('click', (e: any) => {
          L.DomEvent.stopPropagation(e);
          onMarkerClick(p);
        })
        .bindPopup(popupContent, {
          closeButton: false,
          offset: [0, -10],
          className: 'custom-popup'
        });

      clusterGroupRef.current.addLayer(marker);
    });

    if (properties.length > 0 && !selectedProperty) {
      const bounds = clusterGroupRef.current.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [80, 80] });
      }
    }
  }, [properties]);

  useEffect(() => {
    if (selectedProperty && mapRef.current) {
      mapRef.current.flyTo([selectedProperty.lat, selectedProperty.lng], 17, {
        duration: 1.5,
        easeLinearity: 0.1
      });
    }
  }, [selectedProperty]);

  return <div ref={mapContainerRef} className="w-full h-full z-0 outline-none grayscale-[0.2] contrast-[1.1]" />;
};

export default MapView;
