import React from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function BlockedNavigationModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={() => {}}>
        <View style={styles.container}>
          <Text style={styles.title}>Analyse en cours</Text>

          <Text style={styles.description}>
            Tu dois arrêter l’analyse en cours avant de quitter cet écran.
          </Text>

          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Compris</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(7,10,18,0.85)", // cohérent avec ton app
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "85%",
    borderRadius: 22,
    padding: 20,
    backgroundColor: "#0D1222",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  description: {
    color: "rgba(233,238,248,0.65)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#4C7DFF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#4C7DFF",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
