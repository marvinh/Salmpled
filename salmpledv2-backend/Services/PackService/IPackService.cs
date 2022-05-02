
using salmpledv2_backend.Models;
using salmpledv2_backend.Models.ServiceResponse;
using salmpledv2_backend.Models.DTOS;

namespace salmpledv2_backend.Services {
    public interface IPackService {
        Task<ServiceResponse<GetPackDTO>> CreatePack(CreatePackDTO newPack);
        Task<ServiceResponse<String>> NameAvailable(string Name);
        Task<ServiceResponse<GetPackDTO>> GetPackFromPackSlugDTO(PackSlugDTO dto);

        Task<ServiceResponse<List<PeriodDTO>>> History(PackSlugDTO dto);

        Task<object> HistoryOptions(PackSlugDTO dto);

        Task<object> Compare(PackSlugDTO dto);

        Task<ServiceResponse<List<GetPackDTO>>> YourSamplePacks();

        Task<ServiceResponse<List<GetPackDTO>>> CollabPacks();

        Task<object> Search(KeywordDTO keywordDTO);

        Task<object> SearchResults(SearchResultsDTO dto);


    }
}