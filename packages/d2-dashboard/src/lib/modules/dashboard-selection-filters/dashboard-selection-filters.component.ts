import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { keys } from 'lodash';
import {
  DashboardAdditionalFilter,
  VisualizationDataSelection,
  VisualizationDataSelectionItem,
} from '../../models';
import { AdditionalFilterDialogComponent } from './dialogs/additional-filter-dialog/additional-filter-dialog.component';
import { OrgUnitFilterDialogComponent } from './dialogs/org-unit-filter-dialog/org-unit-filter-dialog.component';
import { PeriodFilterDialogComponent } from './dialogs/period-filter-dialog/period-filter-dialog.component';

@Component({
  selector: 'd2-dashboard-selection-filters',
  templateUrl: './dashboard-selection-filters.component.html',
  styleUrls: ['./dashboard-selection-filters.component.scss'],
})
export class DashboardSelectionFiltersComponent {
  @Input() dataSelections!: VisualizationDataSelection[];
  @Input() additionalFilters?: DashboardAdditionalFilter[];
  selectionEntities: { [key: string]: object } = {};
  @Output() setFilterSelection = new EventEmitter<
    VisualizationDataSelection[]
  >();
  constructor(private dialog: MatDialog) {}

  onOpenPeriodDialog(e: MouseEvent) {
    e.stopPropagation();

    const periodDialog = this.dialog.open(PeriodFilterDialogComponent, {
      width: '800px',
      data: {},
    });

    periodDialog.afterClosed().subscribe((res) => {
      if (res?.action === 'UPDATE') {
        this.selectionEntities = {
          ...this.selectionEntities,
          pe: res?.periodObject?.items || [],
        };

        this.setFilterSelection.emit(this._getVisualizationSelections());
      }
    });
  }

  onOpenOrgUnitDialog(e: MouseEvent) {
    e.stopPropagation();

    const orgUnitDialog = this.dialog.open(OrgUnitFilterDialogComponent, {
      width: '800px',
      data: {},
    });

    orgUnitDialog.afterClosed().subscribe((res) => {
      if (res?.action === 'UPDATE') {
        this.selectionEntities = {
          ...this.selectionEntities,
          ou: res?.selectionItems?.items || [],
        };

        this.setFilterSelection.emit(this._getVisualizationSelections());
      }
    });
  }

  onOpenFilterDialog(
    e: MouseEvent,
    additionalFilter: DashboardAdditionalFilter
  ) {
    e.stopPropagation();

    const orgUnitDialog = this.dialog.open(AdditionalFilterDialogComponent, {
      width: '800px',
      data: additionalFilter,
    });

    orgUnitDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.selectionEntities = {
          ...this.selectionEntities,
          [additionalFilter.dimension]: res?.selectedOptions || [],
        };
        this.setFilterSelection.emit(
          this._getVisualizationSelections(additionalFilter)
        );
      }
    });
  }

  private _getVisualizationSelections(
    additionalFilter?: DashboardAdditionalFilter
  ): VisualizationDataSelection[] {
    return keys(this.selectionEntities).map((dimensionKey: string) => {
      const additionalDimension =
        additionalFilter?.dimension == dimensionKey
          ? additionalFilter
          : undefined;
      return {
        dimension: dimensionKey,
        ...(additionalDimension || {}),
        items: this.selectionEntities[
          dimensionKey
        ] as VisualizationDataSelectionItem[],
      };
    });
  }
}
