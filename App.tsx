import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import MedicionConsultaScreen from './src/screens/MedicionConsultaScreen';
import MedicionSave from './src/screens/MedicionSave';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

export default function App() {
  const { width: windowWidth } = useWindowDimensions();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<
    'home' | 'mediciones' | 'medicionConsulta'
  >('home');

  const handleLogin = () => {
    if (username.trim() === 'admin' && contrasenia === '123456') {
      setError('');
      setIsLoggedIn(true);
      return;
    }

    setError('Usuario o contraseña incorrectos.');
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    setIsLoggedIn(false);
    setContrasenia('');
  };

  return (
    <View style={styles.app}>
      <StatusBar style={isLoggedIn ? 'light' : 'dark'} />
      {!isLoggedIn ? (
        <KeyboardAvoidingView style={styles.loginScreen}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.loginContent} keyboardShouldPersistTaps="handled" >
            <View style={styles.loginFormContent}>
              <View style={styles.loginTopline}>
                <Image accessibilityLabel="Logo Cospral" source={require('./assets/icon.png')}
                  style={styles.brandLogo} />
                <Text style={styles.brandName}>COSPRAL</Text>
              </View>

              <Text style={styles.loginTitle}>Bienvenido</Text>
              <Text style={styles.loginSubtitle}>
                Ingresá para comenzar tu jornada de mediciones.
              </Text>

              <View style={styles.form}>
                <Text style={styles.label}>Usuario</Text>
                <TextInput accessibilityLabel="Usuario" autoCapitalize="none"
                  autoCorrect={false} onChangeText={setUsername} placeholder="Escribe tu usuario"
                  placeholderTextColor="#8a918d" returnKeyType="next"
                  style={styles.input} value={username}
                />

                <Text style={[styles.label, styles.passwordLabel]}>Contraseña</Text>
                <TextInput accessibilityLabel="Contraseña" onChangeText={setContrasenia}
                  onSubmitEditing={handleLogin} placeholder="Escribe tu contraseña"
                  placeholderTextColor="#8a918d" returnKeyType="done" secureTextEntry style={styles.input} value={contrasenia}
                />

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Pressable accessibilityRole="button" onPress={handleLogin}
                  style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
                >
                  <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </Pressable>

                <Text style={styles.demoHint}>Acceso de prueba: admin · 123456</Text>
              </View>
            </View>
            <Image accessibilityLabel="Paisaje pampeano con colinas y árboles" resizeMode="cover"
              source={require('./assets/pampas-home.png')} style={[styles.loginLandscape, { width: windowWidth }]}
            />
          </ScrollView>
          <Text style={styles.loginFooter} pointerEvents="none">
            COSPRAL  ·  ACCESO SEGURO
          </Text>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.homeScreen}>
          <View style={styles.homeHeader}>
            <Pressable accessibilityLabel="Abrir menú" accessibilityRole="button"
              onPress={() => setIsMenuOpen(true)} style={styles.menuButton}
            >
              <View style={styles.menuLine} />
              <View style={[styles.menuLine, styles.menuLineShort]} />
              <View style={styles.menuLine} />
            </Pressable>
            <Text style={styles.headerBrand}>COSPRAL</Text>
            <View style={styles.headerSpacer} />
          </View>

          {activeScreen === 'home' ? (
            <ScrollView contentContainerStyle={styles.homeContent}>
              <Text style={styles.eyebrow}>PANEL PRINCIPAL</Text>
              <Text style={styles.homeTitle}>Inicio</Text>
              <View style={styles.welcomeRule} />
              <Text style={styles.welcomeTitle}>Hola, {username.trim()}.</Text>
              <Text style={styles.welcomeBody}>
                Has iniciado sesión correctamente en Cospral.
              </Text>

              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Sesión activa</Text>
              </View>

              <View style={styles.homeFootnote}>
                <Text style={styles.homeFootnoteLabel}>COSPRAL</Text>
                <Text style={styles.homeFootnoteText}>Tu espacio de trabajo</Text>
              </View>
            </ScrollView>
          ) : activeScreen === 'mediciones' ? (
            <MedicionSave />
          ) : (
            <MedicionConsultaScreen />
          )}

          {isMenuOpen ? (
            <View style={styles.menuLayer}>
              <Pressable accessibilityLabel="Cerrar menú"
                onPress={() => setIsMenuOpen(false)} style={styles.menuBackdrop}
              />
              <View style={styles.drawer}>
                <View style={styles.drawerTop}>
                  <View style={styles.drawerMark}>
                    <Text style={styles.drawerMarkText}>C</Text>
                  </View>
                  <Text style={styles.drawerBrand}>COSPRAL</Text>
                  <Text style={styles.drawerUser}>{username.trim()}</Text>
                </View>
                <Text style={styles.drawerSection}>MENÚ</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setActiveScreen('home');
                    setIsMenuOpen(false);
                  }}
                  style={[
                    styles.drawerItem,
                    activeScreen === 'home' && styles.drawerItemActive,
                  ]}
                >
                  <View
                    style={[
                      styles.drawerItemBar,
                      activeScreen !== 'home' && styles.drawerItemBarInactive,
                    ]}
                  />
                  <Text style={styles.drawerItemText}>Inicio</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => {
                  setActiveScreen('mediciones');
                  setIsMenuOpen(false);
                }}
                  style={[styles.drawerItem, activeScreen === 'mediciones' && styles.drawerItemActive,
                  ]}
                >
                  <View
                    style={[styles.drawerItemBar, activeScreen !== 'mediciones' && styles.drawerItemBarInactive,
                    ]}
                  />
                  <Text style={styles.drawerItemText}>Registrar medición</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setActiveScreen('medicionConsulta');
                    setIsMenuOpen(false);
                  }}
                  style={[styles.drawerItem, activeScreen === 'medicionConsulta' && styles.drawerItemActive,
                  ]}
                >
                  <View style={[styles.drawerItemBar,
                  activeScreen !== 'medicionConsulta' && styles.drawerItemBarInactive,
                  ]}
                  />
                  <Text style={styles.drawerItemText}>Consultar mediciones</Text>
                </Pressable>
                <View style={styles.drawerDivider} />
                <Pressable accessibilityRole="button"
                  onPress={handleLogout} style={styles.drawerItem}
                >
                  <Text style={styles.logoutIcon}>↪</Text>
                  <Text style={styles.logoutText}>Cerrar sesión</Text>
                </Pressable>
                <Text style={styles.drawerVersion}>COSPRAL  ·  1.0</Text>
              </View>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#f4f5ef',
  },
  loginScreen: {
    flex: 1,
    backgroundColor: '#f4f5ef',
  },
  loginContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'web' ? 38 : 58,
    paddingBottom: 24,
  },
  loginLandscape: {
    height: 200,
    alignSelf: 'center',
    marginTop: 18,
  },
  loginTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  brandLogo: {
    width: 42,
    height: 42,
  },
  brandName: {
    color: '#155c45',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  eyebrow: {
    color: '#cf623d',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  loginTitle: {
    marginTop: 20,
    color: '#17392f',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
    textAlign: 'center',
  },
  loginFormContent: {
    width: '100%',
    paddingTop: 0,
  },
  loginSubtitle: {
    marginTop: 6,
    color: '#65716b',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'center',
  },
  form: {
    marginTop: 14,
  },
  label: {
    marginBottom: 9,
    color: '#244238',
    fontSize: 13,
    fontWeight: '700',
  },
  passwordLabel: {
    marginTop: 15,
  },
  input: {
    height: 54,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#17392f',
    fontSize: 15,
  },
  errorText: {
    marginTop: 11,
    color: '#b43f32',
    fontSize: 13,
  },
  loginButton: {
    minHeight: 54,
    marginTop: 18,
    paddingHorizontal: 17,
    borderRadius: 8,
    backgroundColor: '#155c45',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.82,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonArrow: {
    color: '#fff',
    fontSize: 22,
  },
  demoHint: {
    marginTop: 15,
    color: '#7b847d',
    fontSize: 12,
    textAlign: 'center',
  },
  loginFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 14,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(17, 43, 30, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  homeScreen: {
    flex: 1,
    backgroundColor: '#f4f5ef',
  },
  homeHeader: {
    height: Platform.OS === 'web' ? 76 : 100,
    paddingTop: Platform.OS === 'web' ? 0 : 24,
    paddingHorizontal: 23,
    backgroundColor: '#155c45',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    gap: 5,
  },
  menuLine: {
    width: 23,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  menuLineShort: {
    width: 16,
  },
  headerBrand: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.7,
  },
  headerSpacer: {
    width: 42,
  },
  homeContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 47,
    paddingBottom: 25,
  },
  homeTitle: {
    marginTop: 8,
    color: '#17392f',
    fontSize: 36,
    fontWeight: '700',
  },
  welcomeRule: {
    width: 47,
    height: 4,
    marginTop: 23,
    borderRadius: 4,
    backgroundColor: '#cf623d',
  },
  welcomeTitle: {
    marginTop: 25,
    color: '#17392f',
    fontSize: 23,
    fontWeight: '700',
  },
  welcomeBody: {
    maxWidth: 420,
    marginTop: 9,
    color: '#65716b',
    fontSize: 15,
    lineHeight: 23,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 9,
    marginTop: 28,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d8ddd5',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#548d60',
  },
  statusText: {
    color: '#38564a',
    fontSize: 12,
    fontWeight: '600',
  },
  homeFootnote: {
    marginTop: 'auto',
    paddingTop: 40,
  },
  homeFootnoteLabel: {
    color: '#155c45',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  homeFootnoteText: {
    marginTop: 5,
    color: '#89918a',
    fontSize: 12,
  },
  menuLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
    flexDirection: 'row',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 31, 25, 0.48)',
  },
  drawer: {
    width: '82%',
    maxWidth: 340,
    height: '100%',
    paddingHorizontal: 23,
    paddingTop: Platform.OS === 'web' ? 30 : 58,
    paddingBottom: 25,
    backgroundColor: '#fbfcf8',
  },
  drawerTop: {
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e5de',
  },
  drawerMark: {
    width: 40,
    height: 40,
    marginBottom: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#155c45',
  },
  drawerMarkText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  drawerBrand: {
    color: '#17392f',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  drawerUser: {
    marginTop: 5,
    color: '#78817b',
    fontSize: 13,
  },
  drawerSection: {
    marginTop: 27,
    marginBottom: 12,
    color: '#8a918d',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  drawerItem: {
    minHeight: 47,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  drawerItemActive: {
    backgroundColor: '#f1f4ef',
  },
  drawerItemBar: {
    width: 3,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#cf623d',
  },
  drawerItemBarInactive: {
    backgroundColor: 'transparent',
  },
  drawerItemText: {
    color: '#17392f',
    fontSize: 14,
    fontWeight: '700',
  },
  drawerDivider: {
    height: 1,
    marginVertical: 9,
    backgroundColor: '#e2e5de',
  },
  logoutIcon: {
    width: 20,
    color: '#b54f3e',
    fontSize: 19,
    textAlign: 'center',
  },
  logoutText: {
    color: '#a44738',
    fontSize: 14,
    fontWeight: '600',
  },
  drawerVersion: {
    marginTop: 'auto',
    color: '#969d97',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
