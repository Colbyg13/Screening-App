import useFields from './useFields';
import useRecords from './useRecords';
import useSearch from './useSearch';
import useSort from './useSort';
import useUnitConversion from './useUnitConversion';

export default function useRecordsManager() {
    const {
        loading: fieldsLoading,
        sortedFieldKeys,
        allFields,
        allFieldKeys,
        fieldKeyMap,
    } = useFields();

    const {
        sort,
        mainSortKey,
        updateSortArray,
    } = useSort({ allFieldKeys });

    const { search, updateSearch } = useSearch();

    const {
        loading: loadingUnitConversion,
        unitConversions,
        updateFieldUnit,
    } = useUnitConversion({ allFields });

    const dependenciesLoaded = (!loadingUnitConversion && !fieldsLoading);

    const {
        loading: loadingRecords,
        atEndOfRecords,
        records,
        selectedRecord,
        getNextPage,
        selectRecord,
        updateRecord,
        deleteRecord,
    } = useRecords({ search, sort, unitConversions, dependenciesLoaded });


    function handleScroll(e) {

        const {
            target: {
                scrollHeight,
                clientHeight,
                scrollTop,
            } = {},
        } = e;

        const margin = 100;
        // loads more when reaching the end of the page
        const bottom = scrollHeight - scrollTop - margin <= clientHeight;

        if (!loadingRecords && !atEndOfRecords && bottom) {
            getNextPage();
        }
    }

    return {
        // fields
        sortedFieldKeys,
        allFields,
        fieldKeyMap,

        // sort
        sort,
        mainSortKey,
        updateSortArray,

        // search
        search,
        updateSearch,

        // unitConversions
        unitConversions,
        updateFieldUnit,

        // records
        loadingRecords,
        atEndOfRecords,
        records,
        selectedRecord,
        selectRecord,
        updateRecord,
        deleteRecord,
        handleScroll,
    };
}