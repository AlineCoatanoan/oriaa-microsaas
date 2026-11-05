import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it("affiche le nom de l'application", () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: 'ORIAA' })).toBeInTheDocument();
  });
});
