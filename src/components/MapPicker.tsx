import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet'

function Picker(props: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      props.onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function MapPicker(props: {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
}) {
  const center = useMemo<[number, number]>(() => [props.lat, props.lng], [props.lat, props.lng])

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
      <div className="h-[260px]">
        <MapContainer center={center} zoom={15} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
          <Picker onPick={props.onChange} />
          <CircleMarker center={center} radius={10} pathOptions={{ color: '#18181b' }} />
        </MapContainer>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-zinc-600">
        <div>
          点击地图选点：{props.lat.toFixed(6)}, {props.lng.toFixed(6)}
        </div>
        <button
          type="button"
          onClick={() => props.onChange(props.lat, props.lng)}
          className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700 transition hover:bg-zinc-200"
        >
          已选
        </button>
      </div>
    </div>
  )
}

