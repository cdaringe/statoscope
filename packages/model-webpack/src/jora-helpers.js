import {
  moduleResource,
  moduleNameResource,
  moduleReasonResource,
  nodeModule,
} from './module';
import makeEntityResolver from './entity-resolver';

export default function (compilationMap) {
  const resolveCompilation = makeEntityResolver(
    compilationMap,
    (item) => item?.compilation?.data?.hash
  );

  return {
    moduleSize(module) {
      // todo gzip
      return module.size;
    },
    chunkName(chunk) {
      return `${chunk.names[0] ? chunk.names.join(', ') : chunk.id}${
        chunk.reason ? ' [' + chunk.reason + ']' : ''
      }`;
    },
    getTotalFilesSize: (value) =>
      (value.files || []).reduce((sum, file) => sum + file.size, 0),
    resolveChunk(id, compilationHash) {
      return resolveCompilation(compilationHash)?.compilation?.resolvers.resolveChunk(id);
    },
    resolveAsset(id, compilationHash) {
      return resolveCompilation(compilationHash)?.compilation?.resolvers.resolveAsset(id);
    },
    resolveModule(id, compilationHash) {
      return resolveCompilation(compilationHash)?.compilation?.resolvers.resolveModule(
        id
      );
    },
    resolvePackage(id, compilationHash) {
      return resolveCompilation(compilationHash)?.compilation?.resolvers.resolvePackage(
        id
      );
    },
    resolveStat(id) {
      const resolved = resolveCompilation(id);
      return (
        resolved && { file: resolved?.file, compilation: resolved?.compilation?.data }
      );
    },
    resolveCompilation(id) {
      const resolved = resolveCompilation(id);
      return resolved && resolved?.compilation?.data;
    },
    moduleResource,
    moduleReasonResource,
    moduleNameResource,
    nodeModule,
    statName(stat) {
      if (!stat) {
        return 'unknown';
      }

      const hash = stat.compilation.hash.slice(0, 7);
      const compilationName =
        stat.compilation.name && moduleNameResource(stat.compilation.name);

      if (stat.file.name) {
        return `${stat.file.name} (${compilationName || hash})`;
      } else if (compilationName) {
        return `${compilationName} (${hash})`;
      }

      return hash;
    },
  };
}
