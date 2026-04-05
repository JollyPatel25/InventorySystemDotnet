import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UserService } from '../../../../core/services/user.service';
import { DialogService } from '../../../../shared/services/dialog.service';
import { UserListItemDto, UserWarehouseAssignmentResponseDto } from '../../../../core/models/user.models';

@Component({
  selector: 'app-user-warehouse-assignments-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './user-warehouse-assignments-list-dialog.component.html',
  styleUrl: './user-warehouse-assignments-list-dialog.component.scss'
})
export class UserWarehouseAssignmentsDialogComponent implements OnInit {
  assignments: UserWarehouseAssignmentResponseDto[] = [];
  loading = false;
  removingId: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<UserWarehouseAssignmentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public user: UserListItemDto,
    private userService: UserService,
    private dialogService: DialogService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.loading = true;
    this.userService.getWarehouseAssignments(this.user.id).subscribe({
      next: res => { this.assignments = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  removeAssignment(assignment: UserWarehouseAssignmentResponseDto): void {
    this.dialogService.confirm({
      title: 'Remove Assignment',
      message: `Remove access to "${assignment.warehouseName}" for ${this.user.firstName} ${this.user.lastName}?`,
      confirmLabel: 'Remove',
      danger: true
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.removingId = assignment.id;
      this.userService.removeWarehouseAssignment(assignment.id).subscribe({
        next: () => {
          this.removingId = null;
          this.snackBar.open('Assignment removed', 'Close', { duration: 3000 });
          this.loadAssignments();
        },
        error: err => {
          this.removingId = null;
          this.snackBar.open(err?.error?.message || 'Failed to remove', 'Close', { duration: 3000 });
        }
      });
    });
  }
}