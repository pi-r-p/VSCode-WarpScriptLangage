import * as vscode from 'vscode';
import * as path from 'path';

export default class GTSPreviewWebview {


  private replaceAll(target: string, search: string, replacement: string) {
    return target.replace(new RegExp(search, 'g'), replacement);
  };

  /**
   * 
   * @param {ExtensionContext} context 
   */
  constructor(private context: vscode.ExtensionContext) { }
  //dark themes : Default Dark+, Visual Studio Dark, Abyss, Kimbie Dark, Monokai, Monokai Dimmed, Red, Solarized Dark, Tomorrow Night Blue, Default High Contrast

  LightThemesList: string[] = [
    "Visual Studio Light",
    "Default Light+",
    "Quiet Light",
    "Solarized Light"
  ];
  /**
   * 
   */
  public async getHtmlContent(data: string, timeUnit: string): Promise<string> {

    //define the theme
    let theme = vscode.workspace.getConfiguration().get('warpscript.theme');
    let showDots = vscode.workspace.getConfiguration().get('warpscript.showDots');
    if (theme == "auto") {
      let vscodetheme: string = vscode.workspace.getConfiguration().get("workbench.colorTheme");
      if (this.LightThemesList.indexOf(vscodetheme) > -1) {
        theme = "light";
      }
      else { theme = "dark"; }
    }

    //get the default values for GTSPreview
    //let alwaysShowMap = vscode.workspace.getConfiguration().get('warpscript.PreviewAlwaysShowMap');
    let chartHeight = vscode.workspace.getConfiguration().get('warpscript.PreviewDefaultChartHeight');
    let mapHeight = vscode.workspace.getConfiguration().get('warpscript.PreviewDefaultMapHeight');

    //build the webcomponent path, the webview way.
    let onDiskPath = vscode.Uri.file(path.join(this.context.extensionPath, 'bower_components', 'senx-warpview', 'dist', 'warpview.js'));
    let warpviewPath: string = onDiskPath.with({ scheme: 'vscode-resource' }).toString();

    //build the logo path, the webview way.
    let LogoonDiskPath = vscode.Uri.file(path.join(this.context.extensionPath, 'images', 'warpstudio.png'));
    let LogoPath: string = LogoonDiskPath.with({ scheme: 'vscode-resource' }).toString();
    let LogoWhiteonDiskPath = vscode.Uri.file(path.join(this.context.extensionPath, 'images', 'warpstudio-white.png'));
    let LogoWhitePath: string = LogoWhiteonDiskPath.with({ scheme: 'vscode-resource' }).toString();

    //build the spectre css path, the webview way.
    let spectreCSSonDiskPath = vscode.Uri.file(path.join(this.context.extensionPath, 'bower_components', 'spectre.css', 'dist', 'spectre.min.css'));
    let spectreCSSPath: string = spectreCSSonDiskPath.with({ scheme: 'vscode-resource' }).toString();


    //build a time unit warning
    let TimeUnitWarning: string = '';
    if (timeUnit != 'us') {
      TimeUnitWarning = `<div class="timeunitwarning">(${timeUnit} time units)</div>`
    }

    const dataEscaped: string = this.replaceAll(data, '"', '&#34;')


    const result = `
    <link href="${spectreCSSPath}" rel="stylesheet">
    <script src="${warpviewPath}"></script>
<style>
    body { 
        background-color: ${theme === 'light' ? '#fff' : '#222'}; 
        color: #000;
        padding: 0;
        --warp-view-switch-width: 50px;
        --warp-view-switch-height: 20px;
        --warp-view-switch-radius: 10px;
        --warp-view-switch-inset-checked-color: #1e7e34;
        --warp-view-switch-handle-checked-color: #28a745; 
        padding-bottom: 20px;
        --warp-view-resize-handle-color: #e6e6e6;
    }
    header {
        background-color: ${theme === 'light' ? '#fff' : '#222'}; 
        color: ${theme !== 'light' ? '#fff' : '#222'}; 
        padding: 5px;
    }

    .navbar-section a, .navbar-section a:hover, .navbar-section a:visited {
        color: ${theme !== 'light' ? '#fff' : '#004eff'} !important; 
    }

    img.logo {
        height: 50px;
        width: auto;
    }
    .links {
        width: auto;
    }
    .container {
        padding: 10px;
    }
    .light {
        background-color: #fff; 
        color: #000; 
        --warp-view-chart-legend-bg: #000;
        --warp-view-switch-inset-checked-color: #00cd00;
        
        --warp-view-chart-legend-bg: #fafafa;  /*#fffbef;*/
        --gts-labelvalue-font-color: #666;
        --gts-separator-font-color: #000;
        --gts-labelname-font-color: rgb(17, 141, 100);
        --gts-classname-font-color: rgb(0, 137, 255);
        --warp-view-chart-legend-color: #000;
    }
    .dark {
        background-color: #222; 
        color: #cccccc;
        --warp-view-font-color: #ffffff;
        --warp-view-chart-label-color: #ffffff;
        --gts-tree-expanded-icon: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAhnpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjadY7BDcQwCAT/VHElYMCLKSeKYikdXPmHz7H8yjxgtYIFur53p8+gsJBVbwiAEwsLOVI0nihzES6jZ508XUsq2TapTIFozrYH7fEXVdHQ3dxRceKUTJdL9V9zh0Yqjzdih6wrrC/++uIHPv4sDZt0gnUAAAoCaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICBleGlmOlBpeGVsWERpbWVuc2lvbj0iMTYiCiAgIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSIxNiIKICAgdGlmZjpJbWFnZVdpZHRoPSIxNiIKICAgdGlmZjpJbWFnZUhlaWdodD0iMTYiCiAgIHRpZmY6T3JpZW50YXRpb249IjEiLz4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PvkekNoAAAAEc0JJVAgICAh8CGSIAAAAf0lEQVQ4y2NgGAUo4P///5q/f/8WwKOE8f////r////nwZD5/ft38n8IuPf//395HJpboGouffr0iQvd9o3/EQDdEGTNMKCJboDS////H2ExBJvmGlxhoIzFkMlommsJBSS6IcRrJmBILalRimxIDVnp4vfv3wI/fvzQGubJHwDuCeYQWCJWzwAAAABJRU5ErkJggg==');
        --gts-tree-collapsed-icon: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAhnpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjadY7BDcQwCAT/VHElYMCLKSeKYikdXPmHz7H8yjxgtYIFur53p8+gsJBVbwiAEwsLOVI0nihzES6jZ508XUsq2TapTIFozrYH7fEXVdHQ3dxRceKUTJdL9V9zh0Yqjzdih6wrrC/++uIHPv4sDZt0gnUAAAoCaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICBleGlmOlBpeGVsWERpbWVuc2lvbj0iMTYiCiAgIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSIxNiIKICAgdGlmZjpJbWFnZVdpZHRoPSIxNiIKICAgdGlmZjpJbWFnZUhlaWdodD0iMTYiCiAgIHRpZmY6T3JpZW50YXRpb249IjEiLz4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PvkekNoAAAAEc0JJVAgICAh8CGSIAAAAZElEQVQ4y82Ruw2AMAwFAzMyAgUjpMgPFkZB1BwlwRVxKHKdZb17km1MlwALcAJOK8g8JI3A8mbVSLyQbBpJ+EMShWQq9+MHxyDmq6Y9ifbYEg4tH/C1hzuKsNNcfgZ2wJruuQHPyrmaqCioTAAAAABJRU5ErkJggg==');
        --gts-stack-font-color: #ffffff;
        --warp-view-switch-inset-color: #545b62;
        --warp-view-switch-handle-color: #6c757d;
        --warp-view-spinner-color: #5899DA;
        --gts-separator-font-color: #8e8e8e;
        --warp-view-resize-handle-color: #111111;

        --warp-view-chart-legend-bg: #000;
        --gts-labelvalue-font-color: #ccc;
        --gts-separator-font-color: #fff;
        --gts-labelname-font-color: rgb(105, 223, 184);
        --gts-classname-font-color: rgb(126, 189, 245);
        --warp-view-chart-legend-color: #fff;
    }
    .timeunitwarning {
        margin: 10px;
    }
</style>
<header class="navbar">
    <section class="navbar-section">
        <img src="${theme === 'light' ? LogoPath : LogoWhitePath}" class="logo">
    </section>
    <section class="navbar-section">
            <a href="https://senx.io" target="_blank" class="btn btn-link">SenX</a>
           <a href="https://www.warp10.io" target="_blank" class="btn btn-link">Warp 10</a>
        </section>
</header>
<div class="container ${theme}">
${TimeUnitWarning}
<warp-view-plot 
  responsive="true" 
  is-alone="true" 
  initial-chart-height="${chartHeight}" 
  initial-map-height="${mapHeight}" 
  data="${dataEscaped}" 
  showLegend="false" 
  options="{&#34timeUnit&#34 : &#34${timeUnit}&#34, &#34showDots&#34: ${showDots} }" ></warp-view-plot>
</div>`
    //console.log(result);
    return result;
  }
}