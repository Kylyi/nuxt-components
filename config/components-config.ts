// @unocss-include
import type { DefineComponent } from 'vue'
import { appConfig } from '~/config'

// Types
import type { IBadgeProps } from '~/components/Badge/types/badge-props.type'
import type { IBannerProps } from '~/components/Banner/types/banner-props.type'
import type { IBtnProps } from '~/components/Button/types/btn-props.type'
import type { IButtonGroupProps } from '~/components/ButtonGroup/types/button-group-props.type'
import type { IMiniCardProps } from '~/components/Card/types/mini-card-props.type'
import type { ICheckboxProps } from '~/components/Checkbox/types/checkbox-props.type'
import type { IChipProps } from '~/components/Chip/types/chip-props.type'
import type { ICollapseProps } from '~/components/Collapse/types/collapse-props.type'
import type { IConfirmationProps } from '~/components/Confirmation/types/confirmation-props.type'
import type { ICrudBtnProps } from '~/components/Crud/types/crud-btn-props.type'
import type { IDatePickerProps } from '~/components/DatePicker/types/datepicker-props.type'
import type { IDialogProps } from '~/components/Dialog/types/dialog-props.type'
import type { IDrawerProps } from '~/components/Drawer/types/drawer-props.type'
import type { IFieldProps } from '~/components/Field/types/field-props.type'
import type { IFileInputProps } from '~/components/FileInput/types/file-input-props.type'
import type { IFloatingUIProps } from '~/components/FloatingUI/types/floating-ui-props.type'
import type { IFormProps } from '~/components/Form/types/form-props.type'
import type { IHeadingProps } from '~/components/Typography/types/heading-props.type'
import type { IColorProps } from '~/components/Inputs/ColorInput/types/color-props.type'
import type { IDateInputProps } from '~/components/Inputs/DateInput/types/date-input-props.type'
import type { IDurationInputProps } from '~/components/Inputs/DurationInput/types/input-duration-props.type'
import type { INumberInputProps } from '~/components/Inputs/NumberInput/types/number-input-props.type'
import type { ITextAreaInputProps } from '~/components/Inputs/TextArea/types/text-area-props.type'
import type { ITextInputProps } from '~/components/Inputs/TextInput/types/text-input-props.type'
import type { ITimeInputProps } from '~/components/Inputs/TimeInput/types/time-input-props.type'
import type { IInputLabelProps } from '~/components/Inputs/types/input-label-props.type'
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'
import type { IItemProps } from '~/components/Item/types/item-props.type'
import type { IListProps } from '~/components/List/types/list-props.type'
import type { IMainBarProps } from '~/components/MainBar/types/main-bar-props.type'
import type { IMenuProps } from '~/components/Menu/types/menu-props.type'
import type { IMenuConfirmationProps } from '~/components/MenuConfirmation/types/menu-confirmation-props.type'
import type { IMonthSelectorProps } from '~/components/MonthSelector/types/month-selector-props.type'
import type { INotificationRowProps } from '~/components/Notification/types/notification-row-props.type'
import type { IPageDrawerProps } from '~/components/Page/types/page-drawer-props.type'
import type { IPageTitleProps } from '~/components/Page/types/page-title-props.type'
import type { IPageWrapperProps } from '~/components/Page/types/page-wrapper-props.type'
import type { IQueryBuilderProps } from '~/components/QueryBuilder/types/query-builder-props.type'
import type { IRadioProps } from '~/components/Radio/types/radio-props.type'
import type { IScrollAreaProps } from '~/components/ScrollArea/types/scroll-area-props.type'
import type { IScrollerProps } from '~/components/Scroller/types/scroller-props.type'
import type { ISectionProps } from '~/components/Section/types/section-props.type'
import type { ISelectorProps } from '~/components/Selector/types/selector-props.type'
import type { ISeparatorProps } from '~/components/Separator/types/separator-props.type'
import type { ISkeletonProps } from '~/components/Skeleton/types/skeleton-props.type'
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type { ITabProps } from '~/components/Tabs/types/tab-props.type'
import type { ITabsProps } from '~/components/Tabs/types/tabs-props.type'
import type { ITextSplitterProps } from '~/components/TextSplitter/types/text-splitter-props.type'
import type { IToggleProps } from '~/components/Toggle/types/toggle-props.type'
import type { ITooltipProps } from '~/components/Tooltip/types/tooltip-props.type'
import type { ITreeProps } from '~/components/Tree/types/tree-props.type'
import type { IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'
import type { IVirtualScrollerProps } from '~/components/VirtualScroller/types/virtual-scroller-props.type'
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'
import type { IYearMonthSelectorProps } from '~/components/YearMonthSelector/types/year-month-selector-props.type'
import type { IYearSelectorProps } from '~/components/YearSelector/types/year-selector-props.type'
import type {
  ITableDataFetchFncInput,
  ITableQuery,
} from '~/components/Table/types/table-query.type'

// Models
import type { ComparatorEnum } from '~/libs/App/enums/comparator.enum'

export const config = merge(
  {
    // Badge
    badge: {
      props: {} as IBadgeProps,
    },

    // Banner
    banner: {
      props: {} as IBannerProps,
    },

    // Breadcrumbs
    breadcrumbs: {
      homePath: '/',
    },

    // Burger
    burger: {},

    // Button
    button: {
      props: {} as IBtnProps,
    },

    // ButtonGroup
    buttonGroup: {
      props: {} as IButtonGroupProps,
    },

    // MiniCard
    miniCard: {
      props: {} as IMiniCardProps,
    },

    // Checkbox
    checkbox: {
      props: {} as ICheckboxProps,
    },

    // Chip
    chip: {
      props: {} as IChipProps,
    },

    // Collapse
    collapse: {
      props: {} as ICollapseProps,
    },

    // Confirmation
    confirmation: {
      props: {} as IConfirmationProps,
    },

    // Crud
    crud: {
      props: {} as ICrudBtnProps,
    },

    // Datepicker
    datepicker: {
      props: {} as IDatePickerProps,
    },

    // Dialog
    dialog: {
      props: {} as IDialogProps,
    },

    // Drawer
    drawer: {
      props: {} as IDrawerProps,
    },

    // Field
    field: {
      props: {} as IFieldProps,
    },

    // File input
    fileInput: {
      props: {
        downloadUrl: undefined,
      } as IFileInputProps,
    },

    // Floating UI
    FloatingUI: {
      props: {} as IFloatingUIProps,
    },

    // Heading
    heading: {
      props: {} as IHeadingProps,
    },

    // Form
    form: {
      props: {
        preventSubmitOnEnter: true,
        focusFirstInput: true,
        dense: true,
      } as IFormProps,

      confirmation: {
        /**
         * When true, the user will be presented with confirmation menu with
         * possibility to add comment when submitting a form
         */
        enabled: false,

        /**
         * When true, the user will be required to add a comment when submitting a form
         */
        required: false,

        /**
         * When true, user will be able to change the `enabled` and `required` props in the UI
         */
        editable: false,

        /**
         * The component to use for the confirmation
         */
        component: undefined as unknown as DefineComponent<any>,
      },

      /**
       * When the form is submitted and no errors are present, this function will be called
       */
      onSubmitSuccess: () => {},
    },

    // Input block
    inputBlock: {},

    // Input - Color input
    colorInput: {
      props: {} as IColorProps,
    },

    // Input - Date input
    dateInput: {
      props: {} as IDateInputProps,
    },

    // Input - Duration input
    durationInput: {
      props: {} as IDurationInputProps,
    },

    // Input - Dynamic input
    dynamicInput: {},

    // Input wrapper
    inputWrapper: {
      props: {
        layout: 'regular',
        stackLabel: true,
      } as IInputWrapperProps,

      borderRadius: '0.5rem',
    },

    // Input - Number input
    numberInput: {
      props: {} as INumberInputProps,
    },

    // Input - Text area
    textArea: {
      props: {} as ITextAreaInputProps,
    },

    // Input - Text input
    textInput: {
      props: {} as ITextInputProps,
    },

    // Input - Time input
    timeInput: {
      props: {} as ITimeInputProps,
    },

    // Input label
    inputLabel: {
      props: {} as IInputLabelProps,
    },

    // Item
    item: {
      props: {} as IItemProps,
    },

    // List
    list: {
      props: {
        noHighlight: true,
        useToBoldLatin: true,
      } as IListProps,
    },

    // Loader
    loader: {},

    // Main bar
    mainBar: {
      props: {} as IMainBarProps,
    },

    // Menu
    menu: {
      props: {} as IMenuProps,
    },

    // Menu confirmation
    menuConfirmation: {
      props: {} as IMenuConfirmationProps,
    },

    // Menu proxy
    menuProxy: {
      props: {} as IDialogProps & IMenuProps,
    },

    monthSelector: {
      props: {} as IMonthSelectorProps,
    },

    // Navigation
    navigation: {},

    // Notification row
    notificationRow: {
      props: {} as INotificationRowProps,
    },

    // Page drawer
    pageDrawer: {
      props: {} as IPageDrawerProps,
    },

    // Page wrapper
    pageWrapper: {
      topBar: undefined as unknown as DefineComponent<any>,
      props: {} as IPageWrapperProps,
    },

    // Page title
    pageTitle: {
      props: {} as IPageTitleProps,
    },

    // Progress bar
    progressBar: {},

    // Query builder
    queryBuilder: {
      props: {} as IQueryBuilderProps,
    },

    // Radio
    radio: {
      props: {} as IRadioProps,
    },

    // Scroll area
    scrollArea: {
      props: {} as IScrollAreaProps,
    },

    // Scroller
    scroller: {
      props: {} as IScrollerProps,
    },

    // Section
    section: {
      props: {} as ISectionProps,
    },

    // Section
    section2: {
      props: {} as ISectionProps,
    },

    // Selector
    selector: {
      mapKey: 'data',
      countKey: 'count',
      shouldFlipOnSearch: true,

      props: {
        hasInfiniteScroll: false,
        fuseExtendedSearchToken:
          "'" as ISelectorProps['fuseExtendedSearchToken'], // Contains
      } as ISelectorProps,
    },

    // Separator
    separator: {
      props: {} as ISeparatorProps,
    },

    // Skeleton
    skeleton: {
      props: {} as ISkeletonProps,
    },

    // Table
    table: {
      props: {
        infiniteScroll: false,
        noSearch: true,
      } as ITableProps,

      /**
       * Whether multiple filters of the same comparator can be used within column filter
       */
      allowComparatorsOfSameType: true,

      /**
       * When true, the column fields provided in URL will be mapped to the columns
       * in case-insensitive way
       *
       * So `modifieddate` or `MODIFIEDdate` will be mapped to `modifiedDate`
       */
      allowCaseInsensitiveColumns: false,

      /**
       * When true, the scheme can be saved as default
       */
      canSaveLayoutAsDefault: false,

      /**
       * When true, the scheme can be saved as public
       */
      canSaveLayoutAsPublic: false,

      /**
       * Settings for the column auto-fit feature
       */
      columnAutoFit: {
        rowsLimit: 1000, // The amount of rows to use to calculate the column width
        maxColumnWidthChars: 100,
        considerHeader: false,
      },

      /**
       * Pagination defaults
       */
      defaultPagination: {
        page: 1,
        pageSize: 100,
      },

      /**
       * When using the `is.empty` comparator, this value will be used
       *
       * Example: `name.is.$empty`
       */
      emptyValue: '$empty',

      // Export component ~ when not provided, the default export component (`TableExportBtn.vue`) will be used
      exportComponent: undefined as unknown as DefineComponent<any>,

      /**
       * Extends the `fetchInput` object with project specific logic
       */
      extendTableFetchInput: (fetchInput: ITableDataFetchFncInput) => {
        return fetchInput
      },

      /**
       * Extracts data from the result of `getData` function and provides it for the table
       *
       * Usage: Let's say the API returns a property `shouldBeExportable: boolean`
       * and we're using the slots in `TableTop` to add the export button. This button should
       * be visible only when `shouldBeExportable` is true. This fuction can be used to extract
       * the `shouldBeExportable` property from the API response and provide for the component
       */
      extractData: (
        res: any,
        options?: {
          externalDataRef?: Ref<IItem>
          metaRef?: MaybeRefOrGetter<IItem>
        },
      ) => {
        return {}
      },

      /**
       * Whether to focus on filter's input on component show/load
       */
      focusOnFilterInput: true,

      /**
       * Creates a query string from the table query object
       */
      getQuery: (query: ITableQuery) => {
        return new URLSearchParams()
      },

      /**
       * Whether the table should include help buttons
       */
      hasHelpButtons: false,

      /**
       * The query builder settings
       */
      queryBuilder: {
        /**
         * Whether the query builder should also show the column filters
         */
        showColumnFilters: true,
      },

      /**
       * If true, the metadata in `localStorage` will be checked first before eventually fetching from the API
       */
      useLocalStorageForMetaFirst: true,

      /**
       * If true, the `localStorage` will be used to load the last used layout when no layout is specified by the API
       */
      useLocalStorageForDefaultLayout: true,
    },

    // Tabs
    tabs: {
      props: {
        noAnimation: true,
      } as ITabsProps,
    },

    // Tab
    tab: {
      props: {} as ITabProps,
    },

    // Text splitter
    textSplitter: {
      props: {} as ITextSplitterProps,
    },

    // Toggle
    toggle: {
      props: {} as IToggleProps,
    },

    // Tooltip
    tooltip: {
      props: {} as ITooltipProps,
    },

    // Tree
    tree: {
      props: {} as ITreeProps,
    },

    // Value formatter
    valueFormatter: {
      props: {} as IValueFormatter,
    },

    // Virtual scroller
    virtualScroller: {
      props: {} as IVirtualScrollerProps,
    },

    // Wisywig
    wysiwyg: {
      props: {} as IWysiwygProps,
    },

    // Year month selector
    yearMonthSelector: {
      props: {} as IYearMonthSelectorProps,
    },

    // Year selector
    yearSelector: {
      props: {} as IYearSelectorProps,
    },

    // Logging
    logging: {
      limit: 100,
    },

    // Data types
    /**
     * We can extend the data types for the application with our own, and map
     * them to the components we want to use for them
     */
    dataTypes: {
      comparators: {},
      inputs: {},

      // We can also extend some of the predefined categories of data types
      selectorComparators: [],
      nonValueComparators: [],
      booleanishComparators: [],
    } satisfies {
      selectorComparators: ComparatorEnum[]
      nonValueComparators: ComparatorEnum[]
      booleanishComparators: ComparatorEnum[]
      comparators: Partial<Record<ExtendedDataType, ComparatorEnum[]>>
      inputs: Partial<
        Record<
          ExtendedDataType,
          {
            component: ComponentInstance<any>
            props: ComponentProps<any>
            icon: string
          }
        >
      >
    },
  },
  appConfig,
)
