import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface Props { children: React.ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (__DEV__) console.error('ErrorBoundary:', error, info);
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      const c = Colors.dark;
      return (
        <View style={[styles.container, { backgroundColor: c.bg }]}>
          <Text style={[styles.title, { color: c.fg }]}>Something went wrong</Text>
          <Text style={[styles.message, { color: c.fgMuted }]}>
            The app encountered an unexpected error. Please try again.
          </Text>
          <Pressable onPress={this.handleReset} style={[styles.button, { backgroundColor: c.accent }]}>
            <Text style={[styles.buttonText, { color: c.bg }]}>Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  message: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  button: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 8, marginTop: 12 },
  buttonText: { fontSize: 14, fontWeight: '700' },
});
