import { useState, useEffect } from 'react';
import apiService from "../../services/apiService";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    TablePagination,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterKind, setFilterKind] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const transactionData = await apiService.getTransactions();
                setTransactions(transactionData);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    // Filtrado combinado
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch =
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.amount.toString().includes(searchTerm);

        const matchesKind =
            filterKind === 'all' || transaction.kind === filterKind;

        const matchesCategory =
            filterCategory === 'all' || transaction.category_id.toString() === filterCategory;

        return matchesSearch && matchesKind && matchesCategory;
    });

    // Paginación
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Obtener categorías y tipos únicos para los filtros
    const uniqueCategories = [...new Set(transactions.map(t => t.category_id))];
    const uniqueKinds = [...new Set(transactions.map(t => t.kind))];

    if (loading) return <div>Cargando transacciones...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <header>
                <div className="welcome">
                    <div className="welcome-container container d-flex flex-md-row flex-column justify-content-between align-items-center py-3">
                        <span className="welcome-text">Transacciones</span>
                    </div>
                </div>
            </header>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <TextField
                    label="Buscar"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <FormControl style={{ minWidth: '120px' }}>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                        value={filterKind}
                        label="Tipo"
                        onChange={(e) => setFilterKind(e.target.value)}
                    >
                        <MenuItem value="all">Todos</MenuItem>
                        {uniqueKinds.map(kind => (
                            <MenuItem key={kind} value={kind}>{kind}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl style={{ minWidth: '120px' }}>
                    <InputLabel>Categoría</InputLabel>
                    <Select
                        value={filterCategory}
                        label="Categoría"
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <MenuItem value="all">Todas</MenuItem>
                        {uniqueCategories.map(category => (
                            <MenuItem key={category} value={category}>{category}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            {/* Tabla */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Monto</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Categoría</TableCell>
                            <TableCell>Fecha</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTransactions
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>{transaction.id}</TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell>{transaction.amount}</TableCell>
                                    <TableCell>{transaction.kind}</TableCell>
                                    <TableCell>
                                        {transaction.category ? (
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div style={{
                                                    width: '15px',
                                                    height: '15px',
                                                    backgroundColor: transaction.category.color,
                                                    marginRight: '8px',
                                                    borderRadius: '3px'
                                                }} />
                                                {transaction.category.name}
                                            </div>
                                        ) : 'Sin categoría'}
                                    </TableCell>
                                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Paginación */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredTransactions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
            />
        </div>
    );
};

export default Transactions;