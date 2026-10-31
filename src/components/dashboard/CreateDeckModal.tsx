import React from 'react';
import { DeckEditorModal, type DeckEditorModalProps } from './DeckEditorModal';

export type CreateDeckModalProps = DeckEditorModalProps;

export const CreateDeckModal: React.FC<CreateDeckModalProps> = (props) => {
  return <DeckEditorModal {...props} />;
};
