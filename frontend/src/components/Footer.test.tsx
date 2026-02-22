import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from './Footer';

describe('Footer Component', () => {
  it('should render footer with copyright information', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} MaatriSahayak. All rights reserved.`)).toBeInTheDocument();
  });

  it('should render app name and description', () => {
    render(<Footer />);
    
    expect(screen.getByText('MaatriSahayak')).toBeInTheDocument();
    expect(screen.getByText('Maternal Health Emergency Response Platform')).toBeInTheDocument();
  });

  it('should render version information', () => {
    render(<Footer />);
    
    expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
  });

  it('should render privacy policy link', () => {
    render(<Footer />);
    
    const privacyLink = screen.getByText('Privacy Policy');
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy');
  });

  it('should render terms of service link', () => {
    render(<Footer />);
    
    const termsLink = screen.getByText('Terms of Service');
    expect(termsLink).toBeInTheDocument();
    expect(termsLink.closest('a')).toHaveAttribute('href', '/terms');
  });

  it('should render contact link', () => {
    render(<Footer />);
    
    const contactLink = screen.getByText('Contact');
    expect(contactLink).toBeInTheDocument();
    expect(contactLink.closest('a')).toHaveAttribute('href', '/contact');
  });

  it('should render social media icons', () => {
    render(<Footer />);
    
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should render system status', () => {
    render(<Footer />);
    
    expect(screen.getByText('System Status:')).toBeInTheDocument();
    expect(screen.getByText('● Operational')).toBeInTheDocument();
  });

  it('should render emergency contact information', () => {
    render(<Footer />);
    
    expect(screen.getByText(/For emergency assistance, please contact your local health authorities./)).toBeInTheDocument();
  });

  it('should have correct social media links', () => {
    render(<Footer />);
    
    const githubLink = screen.getByLabelText('GitHub').closest('a');
    expect(githubLink).toHaveAttribute('href', 'https://github.com');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    
    const emailLink = screen.getByLabelText('Email').closest('a');
    expect(emailLink).toHaveAttribute('href', 'mailto:support@maatrisahayak.com');
  });

  it('should match snapshot', () => {
    const { container } = render(<Footer />);
    expect(container).toMatchSnapshot();
  });
});