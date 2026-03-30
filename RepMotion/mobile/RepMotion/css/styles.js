import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    StyleSheet,
    Platform,
    StatusBar,
} from "react-native";
import { TOKENS } from "../theme/tokens";


const styles = StyleSheet.create({
    // SCREEN
    screen: {
        flex: 1,
        paddingTop: 22,
        backgroundColor: TOKENS.bg,
    },
    header: {
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 12 : 14,
        paddingHorizontal: 16,
        paddingBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 5,
        // marginHorizontal: 5,
    },
    headerTitle: {
        color: TOKENS.textPrimary,
        fontSize: 20,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
    headerRight: {
        flexDirection: "row",
        gap: 10,
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    block: {
        marginBottom: 16,
    },
    searchWrap: {
        height: 44,
        borderRadius: 12,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: TOKENS.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: TOKENS.textPrimary,
        fontWeight: "600",
    },
























    // METRIC / SENTIMENT / MARKET
    marketRow: {
        gap: 10,
        paddingRight: 8,
    },
    marketChip: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: TOKENS.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
        flexDirection: "row",
        alignItems: "center",

        ...Platform.select({
            ios: {
                shadowColor: TOKENS.shadow,
                shadowOpacity: 0.10,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
            },
            android: { elevation: 2 },
        }),
    },
    marketChipLabel: {
        color: TOKENS.textSecondary,
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
    marketChipMove: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    marketChipChange: {
        fontSize: 12,
        fontWeight: "900",
    },
    metricsRow: {
        flexDirection: "row",
        marginTop: 14,
        paddingVertical: 15,
        paddingHorizontal: 14,
        borderRadius: 14,
        backgroundColor: TOKENS.surface2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    metricBlock: {
        flex: 1,
        alignItems: "left",
    },
    metricLabel: {
        fontSize: 11,
        color: TOKENS.textTertiary,
        fontWeight: "800",
        letterSpacing: 0.6,
    },
    metricLableContainer: {
        flex: 1,
        alignItems: 'center',
    },
    metricInfoContainer: {
        marginTop: 10,
    },
    metricLabel: {
        fontSize: 11,
        color: TOKENS.textTertiary,
        fontWeight: "700",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        textAlign: "left",
        alignSelf: "left",
    },
    metricPrimary: {
        marginTop: 4,
        fontSize: 15,
        fontWeight: "800",
    },
    metricValue: {
        marginTop: 4,
        fontSize: 16,
        fontWeight: "900",
    },
    marketValueRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    metricSub: {
        marginTop: 2,
        fontSize: 12,
        color: TOKENS.textSecondary,
        fontWeight: "700",
    },
    metricDivider: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: TOKENS.border,
        marginHorizontal: 12,
    },
    sentimentChip: {
        marginTop: 6,
        alignSelf: "flex-start",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 999,
        marginLeft: -7,
    },
    marketRowExpanded: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 6,
    },
    marketLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    marketPrimaryValue: {
        fontSize: 18,     // 🔥 bigger than sentiment
        fontWeight: "900",
    },
    marketAsset: {
        fontSize: 13,
        fontWeight: "700",
        color: TOKENS.textSecondary,
    },
    sentimentChipText: {
        fontSize: 12,
        fontWeight: "900",
    },
























    // TABS
    tabsWrap: {
        backgroundColor: TOKENS.surface,
        borderRadius: 14,
        padding: 6,
        flexDirection: "row",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    tabItemActive: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.10)",
    },
    tabText: {
        color: TOKENS.textTertiary,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1,
    },
    tabTextActive: {
        color: TOKENS.textPrimary,
    },

    sectionHeader: {
        marginTop: 4,
        marginBottom: 10,
        paddingHorizontal: 2,
    },
    sectionTitle: {
        color: TOKENS.textSecondary,
        fontSize: 12,
        fontWeight: "900",
        letterSpacing: 0.6,
    },
    sectionHint: {
        marginTop: 4,
        color: TOKENS.textTertiary,
        fontSize: 12,
        fontWeight: "600",
    },
    card: {
        backgroundColor: TOKENS.surface2,
        borderRadius: 16,
        padding: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,

        ...Platform.select({
            ios: {
                marginHorizontal: 4,
                shadowColor: TOKENS.shadow,
                shadowOpacity: 0.10,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 8 },
            },
            android: { elevation: 2 },
        }),
    },
    cardRow: {
        flexDirection: "row",
        gap: 12,
    },
    eventIcon: {
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
    },
    cardBody: {
        flex: 1,
    },

    eventTopRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    breakingPill: {
        backgroundColor: "rgba(239,68,68,0.16)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(239,68,68,0.30)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    breakingText: {
        color: "rgba(248,113,113,0.95)",
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 0.4,
    },
    categoryPill: {
        backgroundColor: "rgba(34,197,94,0.14)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(34,197,94,0.45)",

        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,

        shadowColor: "#22C55E",
        shadowOpacity: 0.6,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },

        elevation: 6,
    },
    categoryPillText: {
        color: "rgba(110, 255, 200, 0.95)",
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 0.5,
    },

    eventTitle: {
        color: TOKENS.textPrimary,
        fontSize: 15,
        fontWeight: "900",
        lineHeight: 20,
        letterSpacing: 0.2,
    },
    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
        marginBottom: 10,
    },
    tagPill: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    tagText: {
        color: TOKENS.textSecondary,
        fontSize: 11,
        fontWeight: "800",
    },

    eventSummary: {
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 18,
    },

    miniRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 14,
    },
    miniCard: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
        borderRadius: 14,
        padding: 12,
    },
    miniLabel: {
        color: TOKENS.textTertiary,
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 0.4,
    },
    miniPill: {
        marginTop: 10,
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 12,
    },
    miniPillText: {
        fontSize: 12,
        fontWeight: "900",
    },
    marketMiniRow: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    marketMiniMove: {
        color: TOKENS.up,
        fontSize: 13,
        fontWeight: "900",
    },
    marketMiniSym: {
        marginTop: 6,
        color: TOKENS.textSecondary,
        fontSize: 12,
        fontWeight: "800",
    },

    metaRow: {
        marginTop: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    metaText: {
        color: TOKENS.textTertiary,
        fontSize: 12,
        fontWeight: "700",
    },
    metaDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: TOKENS.border,
    },

    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: TOKENS.border,
        marginTop: 14,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 12,
    },
    detailPill: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    detailLabel: {
        color: TOKENS.textTertiary,
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 0.6,
    },
    detailValue: {
        marginTop: 6,
        color: TOKENS.textPrimary,
        fontSize: 13,
        fontWeight: "900",
    },

    primaryCta: {
        height: 44,
        borderRadius: 14,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255,255,255,0.07)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.12)",
    },
    primaryCtaText: {
        color: TOKENS.textPrimary,
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 0.2,
    },

    gaugeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    gaugeTitle: {
        color: TOKENS.textSecondary,
        fontSize: 16,
        fontWeight: "700",
        textAlignVertical: "center",
    },
    gaugeValue: {
        marginTop: -5,
        color: TOKENS.textPrimary,
        fontSize: 28,
        fontWeight: "900",
        letterSpacing: 0.3,
        textAlignVertical: "center",
    },
    gaugeSubRow: {
        // marginTop: 3,
    },
    gaugeLabel: {
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "800",
        textAlignVertical: "center",
    },
    gaugeHint: {
        marginTop: 4,
        color: TOKENS.textTertiary,
        fontSize: 12,
        fontWeight: "600",
        lineHeight: 16,
    },
    gaugeBarOuter: {
        height: 10,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.06)",
        overflow: "hidden",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    gaugeBarInner: {
        height: 10,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.18)",
    },

    sheetBackdrop: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.45)",
    },
    sheetCard: {
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        backgroundColor: "#111317", // match your theme token
    },
    sheetTitle: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 10,
    },
    sheetList: {
        paddingBottom: 8,
    },
    sheetRow: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    sheetRowActive: {
        // use your active chip bg color
    },
    sheetRowText: {
        fontSize: 15,
    },
    sheetRowTextActive: {
        // use your active text color
    },






















    // EVENT
    detailTopRow: {
        marginTop: 10,
        paddingTop: 35,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    detailIconBtn: {
        height: 36,
        width: 36,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    detailBrand: {
        color: TOKENS.textPrimary,
        fontSize: 15,
        fontWeight: "900",
        letterSpacing: 0.2,
    },

    detailTitle: {
        marginTop: 6,
        color: TOKENS.textPrimary,
        fontSize: 20,
        fontWeight: "900",
        lineHeight: 26,
    },

    detailTagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
    },
    detailTagPill: {
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    detailTagText: {
        color: TOKENS.textSecondary,
        fontSize: 12,
        fontWeight: "800",
    },

    detailMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 10,
    },
    detailMetaText: {
        color: TOKENS.textSecondary,
        fontSize: 12,
        fontWeight: "700",
    },

    detailBanner: {
        marginTop: 14,
        borderRadius: 16,
        padding: 14,
        borderWidth: StyleSheet.hairlineWidth,
    },
    detailBannerTitle: {
        fontSize: 13,
        fontWeight: "900",
    },
    detailBannerText: {
        marginTop: 8,
        color: TOKENS.textSecondary,
        fontSize: 12,
        fontWeight: "700",
        lineHeight: 16,
    },
    assetHeaderRow: {
        marginTop: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    assetHeaderTitle: {
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "900",
    },
    assetSearchWrap: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 10,
        height: 34,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    assetSearchInput: {
        flex: 1,
        color: TOKENS.textPrimary,
        fontSize: 12,
        fontWeight: "700",
    },
    assetRow: {
        paddingTop: 12,
        paddingBottom: 6,
        gap: 10,
    },
    // assetChip
    assetChip: {
        width: 130,
        borderRadius: 14,
        paddingTop: 12,
        paddingHorizontal: 14,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    assetChipLabel: {
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "900",
    },
    assetChipPrice: {
        fontSize: 13,
        fontWeight: "900",
        alignSelf: 'flex-end'
    },
    assetChipValue: {
        fontSize: 13,
        fontWeight: "900",
    },
    // conf
    confWrap: {
        marginTop: 12,
        borderRadius: 16,
        padding: 14,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    confTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    confLabel: {
        color: TOKENS.textTertiary,
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 0.8,
    },
    confValue: {
        fontSize: 13,
        fontWeight: "900",
    },
    confBarOuter: {
        marginTop: 10,
        height: 10,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.06)",
        overflow: "hidden",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    confBarInner: {
        height: 10,
        borderRadius: 999,
    },
    // details
    detailTabsWrap: {
        marginTop: 12,
        flexDirection: "row",
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
        padding: 4,
    },
    detailTab: {
        flex: 1,
        height: 34,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    detailTabActive: {
        backgroundColor: "rgba(99,102,241,0.22)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(99,102,241,0.45)",
    },
    detailTabText: {
        color: TOKENS.textSecondary,
        fontSize: 12,
        fontWeight: "900",
    },
    detailTabTextActive: {
        color: TOKENS.textPrimary,
    },

    detailPanel: {
        marginTop: 10,
        borderRadius: 16,
        padding: 14,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    detailBodyText: {
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "700",
        lineHeight: 18,
    },

    sourceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    sourceText: {
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "800",
    },
























    // FOOTER
    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: Platform.OS === "ios" ? 18 : 12,
        paddingTop: 10,
        paddingHorizontal: 18,
        backgroundColor: "rgba(11,12,15,0.92)",
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: TOKENS.border,
    },
    footerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerItem: {
        width: 110,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        borderRadius: 14,
    },
    footerText: {
        marginTop: 6,
        color: TOKENS.textSecondary,
        fontSize: 11,
        fontWeight: "800",
    },
























    // AUTH PAGES
    authScreen: {
        backgroundColor: TOKENS.bg,
        paddingTop: 44,
        paddingHorizontal: 22,
    },
    authTop: {
        alignItems: "center",
        marginTop: 10,
        marginBottom: 28,
    },
    authBrand: {
        color: TOKENS.textPrimary,
        fontSize: 34,
        fontWeight: "900",
        letterSpacing: 0.2,
    },
    authForm: {
        width: "100%",
    },
    authInputWrap2: {
        height: 48,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
        justifyContent: "center",
        paddingHorizontal: 14,
        marginBottom: 10,
    },
    authInput2: {
        color: TOKENS.textPrimary,
        fontSize: 14,
        fontWeight: "700",
    },
    authForgotBtn: {
        alignSelf: "flex-end",
        marginTop: 2,
        marginBottom: 14,
    },
    authForgotText: {
        color: "rgba(99,102,241,0.95)",
        fontSize: 12,
        fontWeight: "800",
    },
    authBtnIG: {
        height: 46,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(99,102,241,0.85)",
    },
    authBtnTextIG: {
        color: "white",
        fontSize: 14,
        fontWeight: "900",
    },
    authOrRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 18,
        marginBottom: 14,
    },
    authOrLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: TOKENS.border,
    },
    authOrText: {
        marginHorizontal: 12,
        color: TOKENS.textTertiary,
        fontSize: 12,
        fontWeight: "900",
        letterSpacing: 0.8,
    },
    authAltBtn: {
        alignItems: "center",
        paddingVertical: 10,
    },
    authAltText: {
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "800",
    },
    authBottom: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 22,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    authBottomText: {
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "700",
    },
    authBottomLink: {
        color: "rgba(99,102,241,0.95)",
        fontSize: 13,
        fontWeight: "900",
    },
    authTitle: {
        color: TOKENS.textPrimary,
        fontSize: 28,
        fontWeight: "900",
        letterSpacing: 0.2,
    },
    authSubtitle: {
        marginTop: 6,
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "700",
    },
    authSubtitleIG: {
        marginTop: 6,
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "800",
    },
    authCard: {
        marginTop: 14,
        padding: 16,
        borderRadius: 18,
        backgroundColor: TOKENS.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    authField: {
        marginBottom: 12,
    },
    authLabel: {
        color: TOKENS.textTertiary,
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 0.6,
        marginBottom: 6,
        textTransform: "uppercase",
    },
    authInputWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 12,
        height: 46,
        borderRadius: 14,
        backgroundColor: TOKENS.surface2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    authInput: {
        flex: 1,
        color: TOKENS.textPrimary,
        fontSize: 14,
        fontWeight: "700",
    },
    authBtn: {
        marginTop: 8,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(99,102,241,0.22)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(99,102,241,0.45)",
    },
    authBtnText: {
        color: TOKENS.textPrimary,
        fontSize: 15,
        fontWeight: "900",
    },
    authLinkBtn: {
        marginTop: 10,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    authLinkText: {
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "800",
    },
    authError: {
        color: "rgba(248,113,113,0.95)",
        fontWeight: "400",
        marginBottom: 8,
        alignSelf: 'center'
    },













    // USER PROFILE
    profileScreen: {
        backgroundColor: TOKENS.bg,
        paddingTop: 44,
        paddingHorizontal: 22,
    },
    profileTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    profileTop: {
        alignItems: "center",
        marginTop: 6,
        marginBottom: 22,
    },
    profileTitle: {
        color: TOKENS.textPrimary,
        fontSize: 26,
        fontWeight: "900",
    },
    profileEditBtn: {
        height: 34,
        paddingHorizontal: 12,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    profileSub: {
        marginTop: 6,
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "700",
    },
    profileSection: {
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
        padding: 14,
    },
    profileEditText: {
        color: TOKENS.textSecondary,
        fontSize: 12,
        fontWeight: "900",
    },
    profileSectionBox: {
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
        padding: 14,
        marginBottom: 14,
    },
    profileSectionTitle: {
        color: TOKENS.textTertiary,
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        marginBottom: 10,
    },
    profileRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },
    profileRowLabel: {
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "800",
    },
    profileRowValue: {
        color: TOKENS.textPrimary,
        fontSize: 13,
        fontWeight: "800",
    },
    profileDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: TOKENS.border,
        marginVertical: 8,
    },
    settingsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
    },
    settingsBox: {
        marginTop: 10,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    settingsItemText: {
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "900",
    },
    profileAction: {
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
        marginTop: 10,
    },
    profileActionText: {
        color: TOKENS.textSecondary,
        fontSize: 13,
        fontWeight: "900",
    },
    profileLogout: {
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(239,68,68,0.14)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(239,68,68,0.35)",
        marginTop: 10,
    },
    profileLogoutText: {
        color: "rgba(248,113,113,0.95)",
        fontSize: 13,
        fontWeight: "900",
    },
    settingsCard: {
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: TOKENS.border,
        overflow: "hidden", // important for clean edges
    },
    settingsTopRow: {
        height: 46,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    settingsTitle: {
        color: TOKENS.textTertiary,
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 0.8,
    },
    settingsItems: {
        paddingBottom: 6,
    },
    settingsItem: {
        height: 46,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    settingsDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: TOKENS.border,
        marginHorizontal: 14, // inset divider like IG
    },
    settingsDanger: {
        color: "rgba(248,113,113,0.95)",
    },
    langSwitch: {
        paddingHorizontal: 12,
        height: 28,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(99,102,241,0.15)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(99,102,241,0.45)",
    },
    langSwitchText: {
        color: TOKENS.textPrimary,
        fontSize: 12,
        fontWeight: "900",
        letterSpacing: 0.5,
    },
    langSegment: {
        flexDirection: "row",
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: 3,
    },
    langOption: {
        paddingHorizontal: 14,
        height: 28,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    langOptionActive: {
        backgroundColor: "rgba(99,102,241,0.35)",
    },
    langText: {
        fontSize: 12,
        fontWeight: "900",
        color: TOKENS.textSecondary,
        letterSpacing: 0.5,
    },
    langTextActive: {
        color: TOKENS.textPrimary,
    },








    // SCREEN

    dark_bg_full: {
        backgroundColor: "#232323",
    },

    // SEARCH
    search_wrap: {
        height: 44,
        backgroundColor: "#E9E9E9",
        borderRadius: 10,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    search_input: {
        flex: 1,
        fontSize: 14,
        color: "#111",
    },

    // MARKET CHIPS
    market_row: {
        gap: 10,
        paddingTop: 10,
        paddingBottom: 6,
    },
    market_chip: {
        backgroundColor: "#3A3A3A",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 7,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    market_chip_txt: { color: "#DADADA", fontSize: 12, fontWeight: "700" },
    market_chip_up: { color: "#4ADE80", fontSize: 12, fontWeight: "700" },

    // TABS
    tabs_row: {
        flexDirection: "row",
        gap: 10,
        paddingTop: 6,
        paddingBottom: 10,
    },
    tab_pill: {
        backgroundColor: "#3A3A3A",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    tab_pill_active: {
        backgroundColor: "#1D4ED8",
    },
    tab_txt: {
        color: "rgba(255,255,255,0.75)",
        fontSize: 12,
        fontWeight: "700",
    },
    tab_txt_active: {
        color: "#fff",
    },

    // SECTION TITLE
    section_title: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 12,
        fontWeight: "800",
        marginTop: 2,
        marginBottom: 8,
    },

    // EVENT CARD
    event_card: {
        backgroundColor: "#2F2F2F",
        borderRadius: 14,
        padding: 12,
        position: "relative",
    },
    event_left: { width: 40, justifyContent: "flex-start" },
    event_icon_box: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: "#2A2A2A",
        alignItems: "center",
        justifyContent: "center",
    },
    event_body: {
        marginLeft: 40,
        marginRight: 28,
    },
    breaking_pill: {
        alignSelf: "flex-start",
        backgroundColor: "#B91C1C",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 8,
    },
    breaking_txt: { color: "#fff", fontSize: 11, fontWeight: "900" },

    event_headline: {
        color: "#3B82F6",
        fontSize: 14,
        fontWeight: "800",
        lineHeight: 18,
    },

    tag_row: { flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 8 },
    hash_pill: {
        backgroundColor: "#3A3A3A",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    hash_txt: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "700" },

    event_desc: { color: "rgba(255,255,255,0.75)", fontSize: 12, lineHeight: 16 },

    mini_row: { flexDirection: "row", gap: 10, marginTop: 12 },
    mini_card: {
        flex: 1,
        backgroundColor: "#3A3A3A",
        borderRadius: 12,
        padding: 10,
    },
    mini_label: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "800" },
    mini_pill: { marginTop: 8, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },
    mini_pill_red: { backgroundColor: "#7F1D1D" },
    mini_pill_txt: { color: "#FCA5A5", fontWeight: "800", fontSize: 11 },

    market_up_txt: { marginTop: 8, color: "#4ADE80", fontWeight: "900", fontSize: 12 },
    market_sym: { marginTop: 2, color: "rgba(255,255,255,0.7)", fontWeight: "800", fontSize: 12 },

    meta_row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
    meta_txt: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "700" },
    meta_sep: { width: 10 },

    // ARROWS
    event_right: { position: "absolute", right: 10, top: "50%", marginTop: -18 },
    event_arrow_left: { position: "absolute", left: 10, top: "50%", marginTop: -18 },
    arrow_btn: {
        width: 34,
        height: 34,
        borderRadius: 999,
        backgroundColor: "rgba(0,0,0,0.35)",
        alignItems: "center",
        justifyContent: "center",
    },

    // PREDICTION / GAUGE CARD
    gauge_card: {
        backgroundColor: "#2F2F2F",
        borderRadius: 14,
        padding: 18,
        marginTop: 8,
        height: 180,
        alignItems: "center",
        justifyContent: "center",
    },
    gauge_placeholder: { color: "rgba(255,255,255,0.6)", fontWeight: "800" },

    // FOOTER
    footer_container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,

        height: '11%',

        paddingHorizontal: 30,
        justifyContent: 'space-around',

        backgroundColor: "#232323",
    },
    icon_container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    nav_icon: {
        height: 30,
        width: 30,
    },
});

export default styles;
