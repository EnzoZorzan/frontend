// src/components/DataTable.tsx
import { Pencil, Trash2, List } from "lucide-react"; // Ícone extra opcional
import "../styles/datatable.css";

interface Column {
  header: string;
  field: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;

  // ➕ NOVO
  onCustomAction?: (row: any) => void;
  customActionLabel?: string;
}

function getFieldValue(row: any, field: string) {
  return field.split('.').reduce((acc: any, part: string) => {
    if (acc === undefined || acc === null) return "";
    return acc[part];
  }, row);
}

export default function DataTable({
  columns,
  data,
  onEdit,
  onDelete,
  onCustomAction,
  customActionLabel
}: DataTableProps) {

  return (
    <table className="datatable">
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={i}>{col.header}</th>
          ))}
          <th style={{ width: 140 }}>Ações</th>
        </tr>
      </thead>

      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length + 1} className="empty">
              Nenhum registro encontrado.
            </td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr key={i}>
              {columns.map((col, j) => (
                <td key={j}>{String(getFieldValue(row, col.field) ?? "")}</td>
              ))}

              <td className="actions">

                {/* Botão Editar */}
                <button className="edit-btn" onClick={() => onEdit(row)} title="Editar">
                  <Pencil size={16} />
                </button>

                {/* ➕ Botão Extra (ex: Perguntas) */}
                {onCustomAction && (
                  <button
                    className="custom-btn"
                    onClick={() => onCustomAction(row)}
                    title={customActionLabel || "Ação"}
                  >
                    <List size={16} />
                  </button>
                )}

                {/* Botão Excluir */}
                <button className="delete-btn" onClick={() => onDelete(row)} title="Excluir">
                  <Trash2 size={16} />
                </button>

              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
