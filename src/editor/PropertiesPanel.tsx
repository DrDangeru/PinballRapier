import { LevelConfig, WallConfig, BumperConfig, FlipperConfig } from "../levels/types";

interface Props {
  level: LevelConfig;
  selectedId: string | null;
  onUpdateWall: (id: string, updates: Partial<WallConfig>) => void;
  onUpdateBumper: (id: string, updates: Partial<BumperConfig>) => void;
  onDelete: (id: string) => void;
}

export default function PropertiesPanel({
  level,
  selectedId,
  onUpdateWall,
  onUpdateBumper,
  onDelete,
}: Props) {
  if (!selectedId) {
    return (
      <div className="text-gray-500 text-sm p-3">
        Select an element to edit its properties
      </div>
    );
  }

  const wall = level.walls.find((w) => w.id === selectedId);
  const bumper = level.bumpers.find((b) => b.id === selectedId);
  const flipper = level.flippers.find((f) => f.id === selectedId);

  if (wall) return <WallProps wall={wall} onUpdate={onUpdateWall} onDelete={onDelete} />;
  if (bumper) return <BumperProps bumper={bumper} onUpdate={onUpdateBumper} onDelete={onDelete} />;
  if (flipper) return <FlipperProps flipper={flipper} onDelete={onDelete} />;

  return null;
}

function NumberInput({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="text-gray-400">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-20 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-right text-xs"
      />
    </label>
  );
}

function WallProps({
  wall,
  onUpdate,
  onDelete,
}: {
  wall: WallConfig;
  onUpdate: (id: string, u: Partial<WallConfig>) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 p-3">
      <h3 className="text-white font-bold text-sm">Wall</h3>
      <NumberInput label="X" value={Math.round(wall.cx)} onChange={(v) => onUpdate(wall.id, { cx: v })} />
      <NumberInput label="Y" value={Math.round(wall.cy)} onChange={(v) => onUpdate(wall.id, { cy: v })} />
      <NumberInput label="Half W" value={Math.round(wall.hw)} onChange={(v) => onUpdate(wall.id, { hw: v })} />
      <NumberInput label="Half H" value={Math.round(wall.hh)} onChange={(v) => onUpdate(wall.id, { hh: v })} />
      <NumberInput
        label="Rotation"
        value={parseFloat((wall.rotation ?? 0).toFixed(2))}
        onChange={(v) => onUpdate(wall.id, { rotation: v })}
        step={0.1}
      />
      <button
        onClick={() => onDelete(wall.id)}
        className="mt-2 bg-red-900/50 hover:bg-red-800 text-red-300 text-xs py-1 px-3 rounded"
      >
        Delete
      </button>
    </div>
  );
}

function BumperProps({
  bumper,
  onUpdate,
  onDelete,
}: {
  bumper: BumperConfig;
  onUpdate: (id: string, u: Partial<BumperConfig>) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 p-3">
      <h3 className="text-white font-bold text-sm">Bumper</h3>
      <NumberInput label="X" value={Math.round(bumper.cx)} onChange={(v) => onUpdate(bumper.id, { cx: v })} />
      <NumberInput label="Y" value={Math.round(bumper.cy)} onChange={(v) => onUpdate(bumper.id, { cy: v })} />
      <NumberInput label="Radius" value={bumper.radius ?? 20} onChange={(v) => onUpdate(bumper.id, { radius: v })} />
      <NumberInput
        label="Bounce"
        value={bumper.restitution ?? 1.5}
        onChange={(v) => onUpdate(bumper.id, { restitution: v })}
        step={0.1}
      />
      <button
        onClick={() => onDelete(bumper.id)}
        className="mt-2 bg-red-900/50 hover:bg-red-800 text-red-300 text-xs py-1 px-3 rounded"
      >
        Delete
      </button>
    </div>
  );
}

function FlipperProps({
  flipper,
  onDelete,
}: {
  flipper: FlipperConfig;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 p-3">
      <h3 className="text-white font-bold text-sm">
        Flipper ({flipper.isLeft ? "Left" : "Right"})
      </h3>
      <div className="text-gray-400 text-xs">
        X: {Math.round(flipper.anchorX)} Y: {Math.round(flipper.anchorY)}
      </div>
      <button
        onClick={() => onDelete(flipper.id)}
        className="mt-2 bg-red-900/50 hover:bg-red-800 text-red-300 text-xs py-1 px-3 rounded"
      >
        Delete
      </button>
    </div>
  );
}
