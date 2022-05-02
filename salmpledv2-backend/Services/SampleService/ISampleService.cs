
using salmpledv2_backend.Models.DTOS;
using salmpledv2_backend.Models.ServiceResponse;
using salmpledv2_backend.Models;

namespace salmpledv2_backend.Services {
    public interface ISampleService {
        Task<ServiceResponse<GetSampleDTO>> AddSample(AddSampleDTO sample);

        Task<ServiceResponse<List<GetSampleDTO>>> RenameSamples(RenameSampleListDTO list);

        Task<ServiceResponse<List<GetSampleDTO>>> AddTags(AddTagListDTO list);

        Task<ServiceResponse<List<GetSampleDTO>>> RemoveSelected(GenericListDTO list);

        Task<ServiceResponse<List<GetSampleDTO>>> AddBulkSamples(AddSampleListDTO list);

        Task<object> UpdateTempos(TempoListDTO dto);

        

    }
}