import { useState } from 'react';

export const usePagination = (filteredTransactions, initialItemsPerPage) => {
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: initialItemsPerPage
    });

    const totalPages = Math.ceil(filteredTransactions.length / pagination.itemsPerPage);
    const indexOfLastItem = pagination.currentPage * pagination.itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - pagination.itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        setPagination(prev => ({ ...prev, currentPage: pageNumber }));
    };

    const getPaginationGroup = () => {
        const start = Math.max(1, pagination.currentPage - 1);
        const end = Math.min(totalPages, pagination.currentPage + 1);

        let pages = [];
        if (start > 1) pages.push(1);
        if (start > 2) pages.push('...');

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages - 1) pages.push('...');
        if (end < totalPages) pages.push(totalPages);

        return pages;
    };

    return {
        pagination,
        totalPages,
        currentTransactions,
        indexOfFirstItem,
        indexOfLastItem,
        paginate,
        getPaginationGroup
    };
};