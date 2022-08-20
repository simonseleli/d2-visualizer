import { find, intersection, sortBy } from 'lodash';
import { BaseVisualizer, Visualizer } from '../../shared/base-visualizer';
import { SelectionFilterUtil } from '../../shared/utilities';
import { CustomVisualizationTemplate } from './models/custom-visualization-template.model';
import { TrackedEntityInstanceData } from './models/tracked-entity-instance-data.model';

export class CustomVisualizer extends BaseVisualizer implements Visualizer {
  /**
   *
   * @param template
   * @returns
   */
  get template(): CustomVisualizationTemplate {
    if (!this._config?.customTemplate) {
      throw new Error('Template must be provided');
    }
    return this._config.customTemplate as CustomVisualizationTemplate;
  }

  private renderElement(htmlContent: string) {
    const renderingElement = document.getElementById(this._id);

    if (renderingElement) {
      renderingElement?.replaceChildren();
      renderingElement.innerHTML = `
      <style>${this.template.cssStyles}</style>
      ${htmlContent}
      `;
    }
  }

  private getDataVariablesFromTemplate(htmlTemplate: string) {
    return htmlTemplate.match(/\{{([^{^)]+)}}/g);
  }

  private drawWithAnalytics() {
    const dataVariables = this.getDataVariablesFromTemplate(this.template.html);

    let htmlContent = this.template.html;

    const rowIndex: any = {
      value: this._data.headers.indexOf(
        find(this._data.headers, ['name', 'value'])
      ),
      ou: this._data.headers.indexOf(find(this._data.headers, ['name', 'ou'])),
      dx: this._data.headers.indexOf(find(this._data.headers, ['name', 'dx'])),
      pe: this._data.headers.indexOf(find(this._data.headers, ['name', 'pe'])),
    };

    (dataVariables || []).forEach((dataVariable) => {
      const dataDimensions = sortBy(
        dataVariable
          .replace(/[{}']/g, '')
          .split(';')
          .map((dimensionVariable) => {
            const dimensionParams = dimensionVariable.split(':');
            const dimension: string = dimensionParams[0];
            return {
              dimension,
              sortOrder: rowIndex[dimension],
              value: dimensionParams[1],
            };
          }),
        'sortOrder'
      ).map((dimension) => dimension.value);

      const variableValue = (this._data.rows || [])
        .filter((row: string[]) => intersection(row, dataDimensions).length > 0)
        .reduce((sum: number, row: string[]) => {
          sum += parseFloat(row[rowIndex.value] || '0');
          return sum;
        }, 0);

      htmlContent = htmlContent.replace(
        new RegExp(dataVariable, 'g'),
        variableValue
      );
    });

    this.renderElement(htmlContent);
  }

  private drawWithTrackedEntityInstances() {
    const trackerDataInstance = new TrackedEntityInstanceData(
      this._trackedEntityInstances as any[]
    );

    const customFilter = SelectionFilterUtil.getCustomFilter(
      this._dataSelections
    );

    const dataVariables = this.getDataVariablesFromTemplate(this.template.html);
    let htmlContent = this.template.html;

    (dataVariables || []).forEach((dataVariable) => {
      const dataDimensionEntity: any = dataVariable
        .replace(/[{}]/g, '')
        .split(';')
        .reduce((dimensionObject, dimensionVariable) => {
          const dimensionParams = dimensionVariable.split(':');
          const dimension: string = dimensionParams[0];
          return { ...dimensionObject, [dimension]: dimensionParams[1] };
        }, {});

      htmlContent = htmlContent.replace(
        new RegExp(dataVariable, 'g'),
        trackerDataInstance
          .getExpressionData(dataDimensionEntity['dx'], customFilter)
          ?.toString()
      );
    });
    this.renderElement(htmlContent);
  }

  draw() {
    if (this._data) {
      this.drawWithAnalytics();
    }

    if (this._trackedEntityInstances) {
      this.drawWithTrackedEntityInstances();
    }
  }
}
