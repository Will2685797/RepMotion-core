import React from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteSessionModal({ visible, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t("deleteSessionModal.title")}</Text>

          <Text style={styles.description}>
            {t("deleteSessionModal.description")}
          </Text>

          <View style={styles.actionsRow}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>{t("deleteSessionModal.cancel")}</Text>
            </Pressable>

            <Pressable style={styles.deleteButton} onPress={onConfirm}>
              <Text style={styles.deleteText}>{t("deleteSessionModal.delete")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(3, 6, 14, 0.72)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#0B1224",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
  },
  description: {
    color: "rgba(233,238,248,0.70)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cancelText: {
    color: "rgba(233,238,248,0.75)",
    fontWeight: "800",
    fontSize: 15,
  },
  deleteButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF5C5C",
  },
  deleteText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
});
