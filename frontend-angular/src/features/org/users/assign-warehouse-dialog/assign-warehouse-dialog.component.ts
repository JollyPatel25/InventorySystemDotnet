import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../../core/services/user.service';
import { WarehouseService } from '../../../../core/services/warehouse.service';
import { WarehouseResponseDto } from '../../../../core/models/warehouse.models';
import { WarehouseAccessLevel } from '../../../../core/models/user.models';

@Component({
  selector: 'app-assign-warehouse-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatSelectModule,
    MatButtonModule, MatProgressSpinnerModule
  ],
  templateUrl: './assign-warehouse-dialog.component.html'
})
export class AssignWarehouseDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error = '';
  warehouses: WarehouseResponseDto[] = [];
  accessLevels = [WarehouseAccessLevel.View, WarehouseAccessLevel.Manage];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private warehouseService: WarehouseService,
    public dialogRef: MatDialogRef<AssignWarehouseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public userId: string
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      warehouseId: ['', Validators.required],
      accessLevel: ['', Validators.required]
    });

    this.warehouseService.getAll().subscribe({
      next: res => { this.warehouses = res.data; }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.userService.assignWarehouse({
      userId: this.userId,
      warehouseId: this.form.value.warehouseId,
      accessLevel: this.form.value.accessLevel
    }).subscribe({
      next: res => { this.loading = false; this.dialogRef.close(res.data); },
      error: err => {
        this.loading = false;

        this.error =
          err?.error?.Errors?.[0] ||   // ✅ correct
          err?.error?.Message ||      // ✅ correct
          'Something went wrong.';
      }
    });
  }
}