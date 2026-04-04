import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TaxService } from '../../../core/services/tax.service';
import { TaxConfigurationResponseDto } from '../../../core/models/tax.models';
import { DialogService } from '../../../shared/services/dialog.service';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { TaxFormDialogComponent } from './tax-form-dialog/tax-form-dialog.component';

@Component({
  selector: 'app-tax',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    PageHeaderComponent,
    DataTableComponent
  ],
  templateUrl: './tax.component.html',
  styleUrl: './tax.component.scss'
})
export class TaxComponent implements OnInit {
  taxes: TaxConfigurationResponseDto[] = [];
  loading = false;

  columns: TableColumn[] = [
    { key: 'taxName', label: 'Tax Name' },
    { key: 'taxPercentage', label: 'Percentage (%)' },
    { key: 'isActive', label: 'Status', type: 'badge' },
    {
      key: 'actions', label: 'Actions', type: 'actions',
      actions: [
        { icon: 'block', label: 'Deactivate', action: 'deactivate', color: '#c62828' }
      ]
    }
  ];

  constructor(
    private taxService: TaxService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTaxes();
  }

  loadTaxes(): void {
    this.loading = true;
    this.taxService.getAll().subscribe({
      next: res => { this.taxes = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreateDialog(): void {
    this.dialog.open(TaxFormDialogComponent, { width: '480px' })
      .afterClosed().subscribe(result => {
        if (result) {
          this.snackBar.open('Tax configuration created', 'Close', { duration: 3000 });
          this.loadTaxes();
        }
      });
  }

  onAction(event: { action: string; row: TaxConfigurationResponseDto }): void {
    if (event.action === 'deactivate') this.deactivate(event.row);
  }

  deactivate(tax: TaxConfigurationResponseDto): void {
    this.dialogService.confirm({
      title: 'Deactivate Tax',
      message: `Are you sure you want to deactivate "${tax.taxName}"?`,
      confirmLabel: 'Deactivate',
      danger: true
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.taxService.deactivate(tax.id).subscribe({
        next: () => {
          this.snackBar.open('Tax configuration deactivated', 'Close', { duration: 3000 });
          this.loadTaxes();
        },
        error: err => {
          this.snackBar.open(err?.error?.message || 'Failed to deactivate', 'Close', { duration: 3000 });
        }
      });
    });
  }
}