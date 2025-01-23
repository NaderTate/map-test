import { SVGProps } from 'react';

interface MapMarkerProps extends SVGProps<SVGSVGElement> {
  color?: string;
  name?: string;
}

const MapMarker = ({
  color = '#AE8557',
  name = '',
  ...props
}: MapMarkerProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="1em"
    height="1em"
    fill="none"
    {...props}
  >
    <ellipse
      cx={17}
      cy={41.783}
      fill={color}
      opacity={0.15}
      rx={15.786}
      ry={9.217}
    />
    <ellipse
      cx={17}
      cy={41.783}
      fill={color}
      opacity={0.43}
      rx={7.286}
      ry={4.301}
    />
    <path
      fill={color}
      d="M34 17.205c0 7.455-10.467 19.1-14.974 23.77a2.798 2.798 0 0 1-4.051 0C10.466 36.304 0 24.66 0 17.204A17.31 17.31 0 0 1 4.98 5.039 16.898 16.898 0 0 1 17 0c4.509 0 8.833 1.813 12.02 5.04A17.31 17.31 0 0 1 34 17.204Z"
    />

    <circle cx={17} cy={17} r={8} fill="white" />

    {name && (
      <text
        x={35}
        y={60}
        textAnchor="middle"
        fill="black"
        fontSize="12"
        fontFamily="Arial"
        fontWeight="bold"
      >
        {name}
      </text>
    )}
  </svg>
);

export default MapMarker;
