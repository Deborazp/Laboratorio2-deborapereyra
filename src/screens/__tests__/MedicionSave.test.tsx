import React from 'react';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import MedicionSave from '../MedicionSave';
import { useMedicionStore } from '../../stores/medicionStores';

jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
        CameraView: React.forwardRef(function CameraViewMock() {
      return React.createElement(View);
    }),
    useCameraPermissions: () => [{ granted: true }, jest.fn()],
  };
});

jest.mock('expo-image-picker', () => ({
     requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

describe('MedicionSave', () => {
  beforeEach(() => {
    useMedicionStore.setState({ mediciones: [] });
  });

  it('registra una medición al presionar Guardar medición', async () => {
    const { getByLabelText, getByText } = await render(<MedicionSave />);

    fireEvent.changeText(
      getByLabelText('Buscar cliente por nombre, domicilio o DNI'),
      'Emanuel',
    );
    await waitFor(() => getByText('Emanuel Lafuria'));
    await act(async () => {
                  fireEvent.press(getByText('Emanuel Lafuria'));
    });
    await act(async () => {
      fireEvent.press(getByLabelText('Servicio Agua'));
    });

    await act(async () => {
      fireEvent.changeText(getByLabelText('Nueva lectura numérica'), '123,5');
    });
    await act(async () => {
      fireEvent.press(getByLabelText('Guardar medición'));
    });

    await waitFor(() =>
      expect(getByText('La medición se registró correctamente.')).toBeTruthy(),
    );  

    expect(useMedicionStore.getState().mediciones).toHaveLength(1);
                 expect(useMedicionStore.getState().mediciones[0]).toMatchObject({
      clientId: 'client-001',
      servicio: 'Agua',
      value: 123.5,
      realizada: true,
    });
  });
});
