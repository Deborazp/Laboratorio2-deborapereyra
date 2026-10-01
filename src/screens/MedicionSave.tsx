import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { clientes } from '../data/cliente';
import {
  TipoServicio,
  useMedicionStore,
} from '../stores/medicionStores';

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');

export default function MedicionSave() {
  const mediciones = useMedicionStore((state) => state.mediciones);
  const addMedicion = useMedicionStore((state) => state.addMedicion);
  const [clientQuery, setClientQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [servicio, setServicio] = useState<TipoServicio | null>(null);
  const [value, setValue] = useState('');
  const [observation, setObservacion] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const clienteSel = clientes.find((client) => client.id === selectedClientId);
  const suggestions = useMemo(() => {
    const query = normalizeSearch(clientQuery.trim());
    if (!query || clienteSel) return [];

    return clientes
      .filter((client) =>
        normalizeSearch(
          `${client.nombreCompleto} ${client.Direccion} ${client.dni}`,
        ).includes(query),
      )
      .slice(0, 5);
  }, [clientQuery, clienteSel]);

  const medicionAnterior = useMemo(() => {
    if (!selectedClientId || !servicio) return undefined;
    return mediciones.find(
      (medicion) =>
        medicion.clientId === selectedClientId &&
        medicion.servicio === servicio,
    );
  }, [mediciones, selectedClientId, servicio]);

  const medicionReciente = mediciones.slice(0, 5);

  const selectCliente = (clientId: string) => {
    const client = clientes.find((item) => item.id === clientId);
    if (!client) return;
    setSelectedClientId(client.id);
    setClientQuery(client.nombreCompleto);
    setError('');
    setSaved(false);
  };

  const guardarMedicion = () => {
    const numericValue = Number(value.replace(',', '.'));
    if (!selectedClientId) {
      setError('Selecciona un cliente de la lista.');
      return;
    }
    if (!servicio) {
      setError('Selecciona el tipo de servicio.');
      return;
    }
    if (!value.trim() || !Number.isFinite(numericValue) || numericValue < 0) {
      setError('Ingresa una lectura numérica válida, igual o mayor que cero.');
      return;
    }

    addMedicion({
      clientId: selectedClientId,
      servicio: servicio,
      value: numericValue,
      observacion: observation.trim(),
      fecha: ''
    });


    setClientQuery('');
    setSelectedClientId(null);
    setServicio(null);
    setValue('');


    setObservacion('');
    setError('');
    setSaved(true);
  };

  return (<KeyboardAvoidingView style={styles.screen}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.eyebrow}>GESTIÓN DE SERVICIOS</Text>
      <Text style={styles.title}>Registrar medición</Text>
      <Text style={styles.subtitle}>
        Selecciona un cliente y carga la lectura del período.
      </Text>

      <View style={styles.formSection}>
        <Text style={styles.label}>Cliente</Text>
        <TextInput
          accessibilityLabel="Buscar cliente por nombre, domicilio o DNI" autoCapitalize="words"
          autoCorrect={false} onChangeText={(text) => {
            setClientQuery(text); setSelectedClientId(null);
            setError('');
            setSaved(false);
          }}
          placeholder="Nombre, domicilio o DNI"
          placeholderTextColor="#8a918d"
          style={styles.input}
          value={clientQuery}
        />

        {suggestions.length > 0 ? (
          <View style={styles.suggestions}>
            {suggestions.map((client, index) => (
              <Pressable
                accessibilityRole="button" key={client.id}
                onPress={() => selectCliente(client.id)}
                style={[
                  styles.suggestion,
                  index === suggestions.length - 1 && styles.lastSuggestion,
                ]}
              >
                <Text style={styles.suggestionName}>{client.nombreCompleto}</Text>
                <Text style={styles.suggestionMeta}>
                  {client.Direccion}  ·  DNI {client.dni}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {clienteSel ? (
          <View style={styles.clientDetails}>
            <View style={styles.clientDetailRow}>
              <Text style={styles.clientDetailLabel}>DOMICILIO</Text>
              <Text style={styles.clientDetailValue}>
                {clienteSel.Direccion}
              </Text>
            </View>
            <View style={styles.clientDetailRow}>
              <Text style={styles.clientDetailLabel}>DNI</Text>
              <Text style={styles.clientDetailValue}>{clienteSel.dni}</Text>
            </View>
          </View>
        ) : null}

        <Text style={[styles.label, styles.serviceLabel]}>Tipo de servicio</Text>
        <View style={styles.serviceOptions}>
          {(['Agua', 'Luz'] as const).map((item) => {
            const selected = servicio === item;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={item}
                onPress={() => {
                  setServicio(item);
                  setError('');
                  setSaved(false);
                }}
                style={[styles.serviceOption, selected && styles.serviceOptionSelected]}
              >
                <View style={[styles.serviceIcon, selected && styles.serviceIconSelected]}>
                  <Text style={[styles.serviceIconText, selected && styles.serviceIconTextSelected]}>
                    {item === 'Agua' ? '≈' : 'ϟ'}
                  </Text>
                </View>
                <Text style={[styles.serviceText, selected && styles.serviceTextSelected]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, styles.previousLabel]}>Lectura anterior</Text>
        <View style={styles.previousReading}>
          <View>
            <Text style={styles.previousCaption}>
              {servicio ? `ÚLTIMA LECTURA DE ${servicio.toUpperCase()}` : 'SELECCIONA UN SERVICIO'}
            </Text>
            <Text style={styles.previousValue}>
              {medicionAnterior
                ? `${medicionAnterior.value} ${servicio === 'Agua' ? 'm³' : 'kWh'}`
                : '—'}
            </Text>
          </View>
          <View style={styles.previousDateBlock}>
            <Text style={styles.previousCaption}>FECHA</Text>
            <Text style={styles.previousDate}>
              {medicionAnterior
                ? formatDate(medicionAnterior.fecha)
                : 'Sin lectura previa'}
            </Text>
          </View>
        </View>

        <Text style={[styles.label, styles.readingLabel]}>Nueva lectura</Text>
        <View style={styles.numericInputWrap}>
          <TextInput
            accessibilityLabel="Nueva lectura numérica"
            keyboardType="decimal-pad"
            onChangeText={(text) => {
              setValue(text.replace(/[^\d.,]/g, ''));
              setError('');
              setSaved(false);
            }}
            placeholder="0"
            placeholderTextColor="#9aa19a"
            style={styles.numericInput}
            value={value}
          />
          <Text style={styles.unitText}>
            {servicio === 'Agua' ? 'm³' : servicio === 'Luz' ? 'kWh' : 'unidad'}
          </Text>
        </View>

        <Text style={[styles.label, styles.observationLabel]}>Observación</Text>
        <TextInput accessibilityLabel="Observación de la medición" multiline onChangeText={(text) => {
          setObservacion(text);
          setSaved(false);
        }}

          placeholder="Agrega un detalle (opcional)"
          placeholderTextColor="#8a918d"
          style={styles.observationInput}
          textAlignVertical="top"
          value={observation}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {saved ? (
          <View style={styles.successMessage}>
            <View style={styles.successDot} />
            <Text style={styles.successText}>
              La medición se registró correctamente.
            </Text>
          </View>
        ) : null}

        <Pressable accessibilityRole="button" onPress={guardarMedicion} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
        >
          <Text style={styles.saveButtonText}>Guardar medición</Text>
          <Text style={styles.saveArrow}>→</Text>
        </Pressable>
      </View>

      <View style={styles.historySection}>
        <View style={styles.historyHeading}>
          <Text style={styles.historyTitle}>Últimas mediciones</Text>
          <Text style={styles.historyCount}>{mediciones.length}</Text>
        </View>
        {medicionReciente.length === 0 ? (
          <Text style={styles.emptyHistory}>Todavía no hay mediciones registradas.</Text>
        ) : (
          medicionReciente.map((medicion) => {
            const client = clientes.find((item) => item.id === medicion.clientId);
            return (
              <View key={medicion.id} style={styles.historyRow}>
                <View style={styles.historyMain}>
                  <Text style={styles.historyClient}>{client?.nombreCompleto}</Text>
                  <Text style={styles.historyMeta}>
                    {medicion.servicio}  ·  {formatDate(medicion.fecha)}
                  </Text>
                </View>
                <Text style={styles.historyValue}>
                  {medicion.value} {medicion.servicio === 'Agua' ? 'm³' : 'kWh'}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f5ef',
  },
  content: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  eyebrow: {
    color: '#cf623d',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    marginTop: 7,
    color: '#17392f',
    fontSize: 29,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 7,
    color: '#65716b',
    fontSize: 14,
    lineHeight: 21,
  },
  formSection: {
    marginTop: 27,
  },
  label: {
    marginBottom: 8,
    color: '#244238',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    height: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#17392f',
    fontSize: 14,
  },
  suggestions: {
    marginTop: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  suggestion: {
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#edf0eb',
  },
  lastSuggestion: {
    borderBottomWidth: 0,
  },
  suggestionName: {
    color: '#17392f',
    fontSize: 13,
    fontWeight: '700',
  },
  suggestionMeta: {
    marginTop: 4,
    color: '#78817b',
    fontSize: 11,
    lineHeight: 16,
  },
  clientDetails: {
    marginTop: 10,
    padding: 13,
    borderRadius: 8,
    backgroundColor: '#e8eee7',
    gap: 10,
  },
  clientDetailRow: {
    gap: 3,
  },
  clientDetailLabel: {
    color: '#6d7c72',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  clientDetailValue: {
    color: '#244238',
    fontSize: 12,
  },
  serviceLabel: {
    marginTop: 22,
  },
  serviceOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  serviceOption: {
    flex: 1,
    minHeight: 53,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceOptionSelected: {
    borderColor: '#155c45',
    backgroundColor: '#e8eee7',
  },
  serviceIcon: {
    width: 27,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#f0f2ed',
  },
  serviceIconSelected: {
    backgroundColor: '#155c45',
  },
  serviceIconText: {
    color: '#557064',
    fontSize: 17,
    fontWeight: '700',
  },
  serviceIconTextSelected: {
    color: '#fff',
  },
  serviceText: {
    color: '#53645a',
    fontSize: 13,
    fontWeight: '600',
  },
  serviceTextSelected: {
    color: '#155c45',
    fontWeight: '800',
  },
  previousLabel: {
    marginTop: 22,
  },
  previousReading: {
    minHeight: 83,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  previousCaption: {
    color: '#89918a',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  previousValue: {
    marginTop: 5,
    color: '#17392f',
    fontSize: 20,
    fontWeight: '700',
  },
  previousDateBlock: {
    flex: 1,
    alignItems: 'flex-end',
  },
  previousDate: {
    marginTop: 7,
    color: '#53645a',
    fontSize: 11,
    textAlign: 'right',
  },
  readingLabel: {
    marginTop: 22,
  },
  numericInputWrap: {
    height: 54,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  numericInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    color: '#17392f',
    fontSize: 18,
    fontWeight: '600',
  },
  unitText: {
    color: '#718078',
    fontSize: 12,
    fontWeight: '700',
  },
  observationLabel: {
    marginTop: 20,
  },
  observationInput: {
    minHeight: 82,
    paddingHorizontal: 14,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#17392f',
    fontSize: 14,
  },
  errorText: {
    marginTop: 11,
    color: '#b43f32',
    fontSize: 12,
    lineHeight: 17,
  },
  successMessage: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#548d60',
  },
  successText: {
    flex: 1,
    color: '#3f7050',
    fontSize: 12,
    lineHeight: 17,
  },
  saveButton: {
    minHeight: 52,
    marginTop: 20,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#155c45',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.82,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  saveArrow: {
    color: '#fff',
    fontSize: 21,
  },
  historySection: {
    marginTop: 34,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#d8ddd5',
  },
  historyHeading: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyTitle: {
    color: '#17392f',
    fontSize: 16,
    fontWeight: '700',
  },
  historyCount: {
    color: '#718078',
    fontSize: 12,
  },
  emptyHistory: {
    paddingVertical: 14,
    color: '#7b847d',
    fontSize: 12,
  },
  historyRow: {
    minHeight: 62,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e5de',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  historyMain: {
    flex: 1,
  },
  historyClient: {
    color: '#244238',
    fontSize: 12,
    fontWeight: '700',
  },
  historyMeta: {
    marginTop: 4,
    color: '#7b847d',
    fontSize: 10,
  },
  historyValue: {
    color: '#155c45',
    fontSize: 13,
    fontWeight: '800',
  },
});