import { ICON_FAMILY, type IconName } from '../../engine/icons';
import { DRAWINGS } from './drawings';

export function Icon({ name, x, y, size }: { name: IconName; x: number; y: number; size: number }) {
  const Drawing = DRAWINGS[name];
  return (
    <g
      data-icon={name}
      className={`icon ic-${ICON_FAMILY[name]}`}
      transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 40})`}
    >
      <Drawing />
    </g>
  );
}
