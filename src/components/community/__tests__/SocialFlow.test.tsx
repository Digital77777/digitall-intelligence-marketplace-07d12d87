import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SocialActionButton, SocialActions } from '../SocialActionButton';

describe('SocialActionButton', () => {
  it('renders Follow button when state is none and type is follow', () => {
    const onAction = vi.fn();
    render(<SocialActionButton actionType="follow" state="none" onAction={onAction} />);

    const button = screen.getByRole('button', { name: /follow/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders Connect button when state is none and type is connect', () => {
    const onAction = vi.fn();
    render(<SocialActionButton actionType="connect" state="none" onAction={onAction} />);

    const button = screen.getByRole('button', { name: /connect/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders Pending state', () => {
    render(<SocialActionButton actionType="follow" state="pending" onAction={() => {}} />);
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders Follow Back when state is pending_received and type is follow and isFollowedBy is true', () => {
    const onAction = vi.fn();
    render(<SocialActionButton actionType="follow" state="pending_received" onAction={onAction} isFollowedBy={true} />);

    const button = screen.getByRole('button', { name: /follow back/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders Accept when state is pending_received and type is connect', () => {
    const onAction = vi.fn();
    render(<SocialActionButton actionType="connect" state="pending_received" onAction={onAction} />);

    const button = screen.getByRole('button', { name: /accept/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders Following when state is active and type is follow', () => {
    const onAction = vi.fn();
    render(<SocialActionButton actionType="follow" state="active" onAction={onAction} />);

    expect(screen.getByText(/following/i)).toBeInTheDocument();
  });

  it('renders Connected when state is active and type is connect', () => {
    const onAction = vi.fn();
    render(<SocialActionButton actionType="connect" state="active" onAction={onAction} />);

    expect(screen.getByText(/connected/i)).toBeInTheDocument();

    // Test hover state or secondary action if applicable
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

describe('SocialActions', () => {
  it('renders both buttons', () => {
    render(
      <SocialActions
        userId="user-1"
        isFollowing={false}
        connectionStatus="none"
        onFollow={() => {}}
        onUnfollow={() => {}}
        onConnect={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
  });

  it('shows Following when isFollowing is true', () => {
    render(
      <SocialActions
        userId="user-1"
        isFollowing={true}
        connectionStatus="none"
        onFollow={() => {}}
        onUnfollow={() => {}}
        onConnect={() => {}}
      />
    );

    expect(screen.getByText(/following/i)).toBeInTheDocument();
  });
});
