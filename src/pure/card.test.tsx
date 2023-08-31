import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import * as Card from './card';

const quotes = {
	[Card.Language.English]: 'e',
	[Card.Language.French]: 'f',
	[Card.Language.Spanish]: 's',
	[Card.Language.German]: 'g'
};

describe('<Card.View> - render', () => {
	const tests = [
		{
			selectedLanguage: Card.Language.English,
			want: {
				quote: 'e',
				button: 'English'
			}
		},
		{
			selectedLanguage: Card.Language.French,
			want: {
				quote: 'f',
				button: 'French'
			}
		},
		{
			selectedLanguage: Card.Language.Spanish,
			want: {
				quote: 's',
				button: 'Spanish'
			}
		},
		{
			selectedLanguage: Card.Language.German,
			want: {
				quote: 'g',
				button: 'German'
			}
		}
	];

	tests.forEach((t) => {
		it('renders correctly', () => {
			const onChangeLanguage = vi.fn();
			const { container } = render(
				<Card.View quotes={quotes} selectedLanguage={t.selectedLanguage} onChangeLanguage={onChangeLanguage} />
			);
			expect(container.getElementsByClassName('bottom').item(0)?.textContent).toEqual(t.want.quote);
			expect(container.getElementsByClassName('selected').item(0)?.textContent).toEqual(t.want.button);
		});
	});
});

describe('<Card.View> - events', () => {
	it('calls onChangeLanguage', () => {
		const onChangeLanguage = vi.fn();
		const { container } = render(
			<Card.View quotes={quotes} selectedLanguage={Card.Language.Spanish} onChangeLanguage={onChangeLanguage} />
		);

		fireEvent.click(screen.getByText('German'));

		expect(onChangeLanguage).toHaveBeenCalledOnce();
		expect(onChangeLanguage).toHaveBeenCalledWith(Card.Language.German);
	});
});
