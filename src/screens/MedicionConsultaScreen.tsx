import { useMemo, useState } from 'react';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
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
  Medicion,
  TipoServicio,
  useMedicionStore,
} from '../stores/medicionStores';

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));

const toLocalDate = (date: string) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatFilterDate = (date: Date) =>
  new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(date);

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');

export default function MedicionConsultaScreen() {
  const mediciones = useMedicionStore((state) => state.mediciones);
  const actualizarMedicion = useMedicionStore((state) => state.actualizarMedicion);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [clientFilter, setClientFilter] = useState('');
  const [filterClientId, setFilterClientId] = useState<string | null>(null);
  const [selectedMediciontId, setSelectedMediccionId] = useState<string | null>(null);
  const [isEdiccion, setIsEdiccion] = useState(false);
  const [editClientQuery, setEditClientQuery] = useState('');


  const [editClientId, setEditClientId] = useState<string | null>(null);
  const [editService, setEditServicio] = useState<TipoServicio>('Agua');


  const [editValue, setEditValue] = useState('');
  const [editObservation, setEditObservacion] = useState('');
  const [editError, setEditError] = useState('');
  const [editSaved, setEditSaved] = useState(false);

  const medicionSel = mediciones.find(
    (medicion) => medicion.id === selectedMediciontId,
  );
  const editingClient = clientes.find((cliente) => cliente.id === editClientId);

  const filterSuggestions = useMemo(() => {
    const query = normalizeSearch(clientFilter.trim());
    if (!query || filterClientId) return [];
    return clientes
      .filter((client) =>
        normalizeSearch(
          `${client.nombreCompleto} ${client.Direccion} ${client.dni}`,
        ).includes(query),
      )
      .slice(0, 5);
  }, [clientFilter, filterClientId]);

  const editSuggestions = useMemo(() => {
    const query = normalizeSearch(editClientQuery.trim());
    if (!query || editingClient) return [];
    return clientes
      .filter((cliente) =>
        normalizeSearch(
          `${cliente.nombreCompleto} ${cliente.Direccion} ${cliente.dni}`,
        ).includes(query),
      )
      .slice(0, 5);
  }, [editClientQuery, editingClient]);

  const filteredMediciones = useMemo(() => {
    const query = normalizeSearch(clientFilter.trim());
    const normalizedDate = dateFilter ? toLocalDate(dateFilter.toISOString()) : '';
    return mediciones.filter((medicion) => {
      const client = clientes.find((item) => item.id === medicion.clientId);
      if (filterClientId && medicion.clientId !== filterClientId) return false;
      if (
        query &&
        !filterClientId &&
        !normalizeSearch(
          `${client?.nombreCompleto ?? ''} ${client?.Direccion ?? ''} ${client?.dni ?? ''}`,
        ).includes(query)
      ) {
        return false;
      }
      return !normalizedDate || toLocalDate(medicion.fecha) === normalizedDate;
    });
  }, [mediciones, clientFilter, filterClientId, dateFilter]);

  const beginEdit = (medicion: Medicion) => {
    const cliente = clientes.find((item) => item.id === medicion.clientId);
    setSelectedMediccionId(medicion.id);
    setIsEdiccion(true);
    setEditClientId(medicion.clientId);
    setEditClientQuery(cliente?.nombreCompleto ?? '');
    setEditServicio(medicion.servicio);
    setEditValue(String(medicion.value));
    setEditObservacion(medicion.observacion);
    setEditError('');
    setEditSaved(false);




  };

  const saveChanges = () => {


    const numericValue = Number(editValue.replace(',', '.'));
    if (!medicionSel || !editClientId) {
      setEditError('Selecciona un cliente de la lista.');
      return;
    }


    if (!editValue.trim() || !Number.isFinite(numericValue) || numericValue < 0) {
      setEditError('Ingresa una lectura numérica válida, igual o mayor que cero.');
      return;
    }

    actualizarMedicion(medicionSel.id, {
      clientId: editClientId,
      servicio: editService,
      value: numericValue,
      observacion: editObservation.trim(),
      fecha: ''
    });
    setEditError('');
    setEditSaved(true);
    setIsEdiccion(false);
  };

  const clearFilters = () => {
    setDateFilter(null);
    setIsCalendarVisible(false);
    setClientFilter('');
    setFilterClientId(null);


  };

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dateFilter ?? new Date(),
        mode: 'date',
        display: 'calendar',
        onValueChange: (_event, selectedDate) => setDateFilter(selectedDate),
      });
      return;
    }
    setIsCalendarVisible((visible) => !visible);
  };

  const closeRecord = () => {
    setSelectedMediccionId(null);
    setIsEdiccion(false);
    setEditSaved(false);
    setEditError('');
  };

  const cliente = medicionSel
    ? clientes.find((item) => item.id === medicionSel.clientId)
    : undefined;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {medicionSel ? (
          <>
            <Pressable accessibilityRole="button" onPress={closeRecord} style={styles.backButton}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Volver a mediciones</Text>
            </Pressable>

            <Text style={styles.eyebrow}>
              {isEdiccion ? 'EDICIÓN DE REGISTRO' : 'DETALLE DEL REGISTRO'}
            </Text>

            <Text style={styles.title}>
              {isEdiccion ? 'Modificar medición' : 'Detalle de medición'}
            </Text>

            {isEdiccion ? (
              <View style={styles.editForm}>
                <Text style={styles.label}>Cliente</Text>
                <TextInput
                  accessibilityLabel="Buscar cliente para modificar"
                  autoCapitalize="words"
                  autoCorrect={false}
                  onChangeText={(text) => {
                    setEditClientQuery(text);
                    setEditClientId(null);
                    setEditError('');
                  }}
                  placeholder="Nombre, domicilio o DNI"
                  placeholderTextColor="#8a918d"
                  style={styles.input}
                  value={editClientQuery}
                />
                {editSuggestions.length > 0 ? (
                  <View style={styles.suggestions}>
                    {editSuggestions.map((suggestedClient, index) => (
                      <Pressable
                        accessibilityRole="button"
                        key={suggestedClient.id}
                        onPress={() => {
                          setEditClientId(suggestedClient.id);
                          setEditClientQuery(suggestedClient.nombreCompleto);
                          setEditError('');
                        }}
                        style={[
                          styles.suggestion,
                          index === editSuggestions.length - 1 && styles.lastSuggestion,
                        ]}
                      >
                        <Text style={styles.suggestionName}>
                          {suggestedClient.nombreCompleto}
                        </Text>
                        <Text style={styles.suggestionMeta}>
                          {suggestedClient.Direccion}  ·  DNI {suggestedClient.dni}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
                {editingClient ? (
                  <Text style={styles.selectedClientMeta}>
                    {editingClient.Direccion}  ·  DNI {editingClient.dni}
                  </Text>
                ) : null}

                <Text style={[styles.label, styles.fieldSpacing]}>Servicio</Text>



                <View style={styles.serviceOptions}>
                  {(['Agua', 'Luz'] as const).map((service) => (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected: editService === service }}
                      key={service}
                      onPress={() => setEditServicio(service)}
                      style={[                        styles.serviceOption,
                        editService === service && styles.serviceOptionSelected,
                      ]}
                    >
                      <Text
                        style={[                          styles.serviceText,
                          editService === service && styles.serviceTextSelected,
                        ]}
                      >
                        {service}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.label, styles.fieldSpacing]}>Lectura</Text>
                <TextInput                  accessibilityLabel="Modificar lectura"
                  keyboardType="decimal-pad"                  onChangeText={(text) => setEditValue(text.replace(/[^\d.,]/g, ''))}
                  placeholder="0"                  placeholderTextColor="#9aa19a"
                  style={styles.input}
                  value={editValue}
                />

                <Text style={[styles.label, styles.fieldSpacing]}>Observación</Text>
                <TextInput accessibilityLabel="Modificar observación" multiline
                  onChangeText={setEditObservacion} placeholder="Observación opcional"
                  placeholderTextColor="#8a918d" style={styles.observacionInput} textAlignVertical="top"
                  value={editObservation}
                />
                <Text style={styles.originalDate}>
                  Fecha de toma: {formatDate(medicionSel.fecha)}
                </Text>
                {editError ? <Text style={styles.errorText}>{editError}</Text> : null}
                <View style={styles.actionRow}>
                  <Pressable accessibilityRole="button" onPress={() => {
                    setIsEdiccion(false);
                    setEditError('');
                  }}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>Cancelar</Text>
                  </Pressable>
                  <Pressable                    accessibilityRole="button"
                    onPress={saveChanges}                    style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.primaryButtonText}>Guardar cambios</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.detailSection}>
                {editSaved ? (
                  <View style={styles.successMessage}>
                    <View style={styles.successDot} />
                    <Text style={styles.successText}>
                      Los cambios se guardaron correctamente.
                    </Text>
                  </View>
                ) : null}
                <View style={styles.detailHeader}>
                  <View style={styles.serviceBadge}>
                    <Text style={styles.serviceBadgeText}>
                      {medicionSel.servicio.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {medicionSel.value}{' '}
                    {medicionSel.servicio === 'Agua' ? 'm³' : 'kWh'}
                  </Text>
                </View>
                <View style={styles.detailDivider} />
                <DetailRow label="CLIENTE" value={cliente?.nombreCompleto ?? 'Cliente no disponible'} />
                <DetailRow label="DOMICILIO" value={cliente?.Direccion ?? '—'} />
                <DetailRow label="DNI" value={cliente?.dni ?? '—'} />
                <DetailRow label="FECHA DE TOMA" value={formatDate(medicionSel.fecha)} />

                <DetailRow
                  label="OBSERVACIÓN"
                  value={medicionSel.observacion || 'Sin observaciones'}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => beginEdit(medicionSel)}
                  style={({ pressed }) => [styles.primaryButton, styles.detailEditButton, pressed && styles.pressed]}
                >
                  <Text style={styles.primaryButtonText}>Modificar medición</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.eyebrow}>HISTORIAL</Text>
            <Text style={styles.title}>Consultar mediciones</Text>
            <Text style={styles.subtitle}>
              Filtra los registros y abre su detalle para modificarlos.
            </Text>

            <View style={styles.filters}>
              <View style={styles.filterField}>
                <Text style={styles.label}>Fecha de medición</Text>
                <Pressable accessibilityLabel="Abrir calendario para filtrar por fecha" accessibilityRole="button"
                  onPress={openDatePicker}
                  style={styles.datePickerButton}
                >
                  <Text style={styles.datePickerValue}>
                    {dateFilter ? formatFilterDate(dateFilter) : 'Todas las fechas'}
                  </Text>
                  <Text style={styles.datePickerAction}>
                    {Platform.OS === 'ios' && isCalendarVisible
                      ? 'Cerrar'
                      : 'Calendario'}
                  </Text>
                </Pressable>
                {Platform.OS === 'ios' && isCalendarVisible ? (
                  <View style={styles.inlineCalendar}>
                    <DateTimePicker accentColor="#155c45"
                      display="inline" mode="date"
                      onValueChange={(_event, selectedDate) => setDateFilter(selectedDate)}
                      themeVariant="light" value={dateFilter ?? new Date()}
                    />
                  </View>
                ) : null}
              </View>
              <View style={styles.filterField}>
                <Text style={styles.label}>Cliente</Text>
                <TextInput accessibilityLabel="Filtrar por cliente" autoCapitalize="words"
                  autoCorrect={false} onChangeText={(text) => {
                    setClientFilter(text);
                    setFilterClientId(null);
                  }}
                  placeholder="Nombre, domicilio o DNI" placeholderTextColor="#8a918d" style={styles.input}
                  value={clientFilter}
                />
                {filterSuggestions.length > 0 ? (
                  <View style={styles.suggestions}>
                    {filterSuggestions.map((suggestedClient, index) => (
                      <Pressable accessibilityRole="button" key={suggestedClient.id} onPress={() => {
                        setClientFilter(suggestedClient.nombreCompleto); setFilterClientId(suggestedClient.id);
                      }}
                        style={[
                          styles.suggestion,
                          index === filterSuggestions.length - 1 && styles.lastSuggestion,
                        ]}
                      >
                        <Text style={styles.suggestionName}>
                          {suggestedClient.nombreCompleto}
                        </Text>
                        <Text style={styles.suggestionMeta}>
                          {suggestedClient.Direccion}  ·  DNI {suggestedClient.dni}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={clearFilters}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Limpiar filtros</Text>
              </Pressable>
            </View>

            <View style={styles.resultsHeading}>
              <Text style={styles.resultsTitle}>Resultados</Text>
              <Text style={styles.resultCount}>{filteredMediciones.length}</Text>
            </View>
            {filteredMediciones.length === 0 ? (
              <Text style={styles.emptyState}>
                {mediciones.length === 0
                  ? 'Todavía no hay mediciones registradas.'
                  : 'No hay mediciones que coincidan con esos filtros.'}
              </Text>
            ) : (filteredMediciones.map((medicion) => {
              const medicionCliente = clientes.find(
                (item) => item.id === medicion.clientId,
              );
              return (
                <View key={medicion.id} style={styles.medicionRow}>
                  <View style={styles.medicionTopline}>
                    <View style={styles.serviceBadge}>
                      <Text style={styles.serviceBadgeText}>
                        {medicion.servicio.toUpperCase()}
                      </Text>
                    </View>


                    <Text style={styles.rowDate}>{formatDate(medicion.fecha)}</Text>
                  </View>
                  <Text style={styles.rowClient}>
                    {medicionCliente?.nombreCompleto ?? 'Cliente no disponible'}
                  </Text>
                  <Text style={styles.rowAddress}>
                    {medicionCliente?.Direccion ?? '—'}
                  </Text>
                  <View style={styles.rowFooter}>
                    <Text style={styles.rowValue}>
                      {medicion.value}{' '}
                      {medicion.servicio === 'Agua' ? 'm³' : 'kWh'}
                    </Text>
                    <View style={styles.rowActions}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          setSelectedMediccionId(medicion.id);
                          setIsEdiccion(false);
                          setEditSaved(false);
                        }}
                        style={styles.textAction}
                      >
                        <Text style={styles.textActionLabel}>Ver detalle</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => beginEdit(medicion)}
                        style={styles.textAction}
                      >
                        <Text style={styles.textActionLabel}>Modificar</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailText}>{value}</Text>
    </View>
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
    paddingTop: 30,
    paddingBottom: 42,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backArrow: {
    color: '#155c45',
    fontSize: 20,
  },
  backText: {
    color: '#155c45',
    fontSize: 12,
    fontWeight: '700',
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
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 7,
    color: '#65716b',
    fontSize: 13,
    lineHeight: 20,
  },
  filters: {
    marginTop: 23,
    padding: 15,
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 15,
  },
  filterField: {
    zIndex: 1,
  },
  label: {
    marginBottom: 8,
    color: '#244238',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#17392f',
    fontSize: 13,
  },
  datePickerButton: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  datePickerValue: {
    flex: 1,
    color: '#17392f',
    fontSize: 13,
  },
  datePickerAction: {
    color: '#155c45',
    fontSize: 11,
    fontWeight: '700',
  },
  inlineCalendar: {
    marginTop: 9,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
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
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#edf0eb',
  },
  lastSuggestion: {
    borderBottomWidth: 0,
  },
  suggestionName: {
    color: '#17392f',
    fontSize: 12,
    fontWeight: '700',
  },
  suggestionMeta: {
    marginTop: 4,
    color: '#78817b',
    fontSize: 10,
    lineHeight: 15,
  },
  clearButton: {
    minHeight: 38,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  clearButtonText: {
    color: '#a44738',
    fontSize: 12,
    fontWeight: '700',
  },
  resultsHeading: {
    marginTop: 28,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsTitle: {
    color: '#17392f',
    fontSize: 17,
    fontWeight: '700',
  },
  resultCount: {
    color: '#718078',
    fontSize: 12,
  },
  emptyState: {
    paddingVertical: 18,
    color: '#7b847d',
    fontSize: 13,
  },
  medicionRow: {
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  medicionTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  serviceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#e8eee7',
  },
  serviceBadgeText: {
    color: '#155c45',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  rowDate: {
    flex: 1,
    color: '#7b847d',
    fontSize: 10,
    textAlign: 'right',
  },
  rowClient: {
    marginTop: 11,
    color: '#17392f',
    fontSize: 14,
    fontWeight: '700',
  },
  rowAddress: {
    marginTop: 4,
    color: '#78817b',
    fontSize: 11,
    lineHeight: 16,
  },
  rowFooter: {
    minHeight: 38,
    marginTop: 9,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#edf0eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowValue: {
    color: '#155c45',
    fontSize: 14,
    fontWeight: '800',
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  textAction: {
    minHeight: 36,
    justifyContent: 'center',
  },
  textActionLabel: {
    color: '#155c45',
    fontSize: 11,
    fontWeight: '700',
  },
  detailSection: {
    marginTop: 22,
    padding: 17,
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailValue: {
    color: '#17392f',
    fontSize: 25,
    fontWeight: '700',
  },
  detailDivider: {
    height: 1,
    marginVertical: 17,
    backgroundColor: '#e5e9e2',
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    color: '#89918a',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  detailText: {
    marginTop: 5,
    color: '#244238',
    fontSize: 13,
    lineHeight: 19,
  },
  detailEditButton: {
    marginTop: 7,
  },
  editForm: {
    marginTop: 20,
  },
  fieldSpacing: {
    marginTop: 20,
  },
  selectedClientMeta: {
    marginTop: 7,
    color: '#65716b',
    fontSize: 11,
    lineHeight: 16,
  },
  serviceOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  serviceOption: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  serviceOptionSelected: {
    borderColor: '#155c45',
    backgroundColor: '#e8eee7',
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
  observacionInput: {
    minHeight: 84,
    paddingHorizontal: 13,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#17392f',
    fontSize: 13,
  },
  originalDate: {
    marginTop: 12,
    color: '#78817b',
    fontSize: 11,
  },
  errorText: {
    marginTop: 10,
    color: '#b43f32',
    fontSize: 12,
    lineHeight: 17,
  },
  actionRow: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd4cc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#38564a',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderRadius: 8,
    backgroundColor: '#155c45',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
  successMessage: {
    marginBottom: 15,
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
});