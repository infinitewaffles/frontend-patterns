import { JSX, forwardRef } from 'preact/compat';

export default forwardRef<SVGSVGElement, JSX.SVGAttributes<SVGSVGElement> & JSX.HTMLAttributes<EventTarget>>(
	(props, ref) => (
		<svg
			class={props.class}
			style={props.style}
			ref={ref}
			width="14"
			height="23"
			viewBox="0 0 14 23"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g>
				<rect width="14" height="23" rx="4" fill="currentColor" />
				<circle id="Ellipse 1" cx="4.5" cy="6.5" r="1.5" fill="#F4EBFF" />
				<circle id="Ellipse 3" cx="4.5" cy="11.5" r="1.5" fill="#F4EBFF" />
				<circle id="Ellipse 5" cx="4.5" cy="16.5" r="1.5" fill="#F4EBFF" />
				<circle id="Ellipse 2" cx="9.5" cy="6.5" r="1.5" fill="#F4EBFF" />
				<circle id="Ellipse 4" cx="9.5" cy="11.5" r="1.5" fill="#F4EBFF" />
				<circle id="Ellipse 6" cx="9.5" cy="16.5" r="1.5" fill="#F4EBFF" />
			</g>
		</svg>
	)
);
